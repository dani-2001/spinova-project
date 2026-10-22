"""
Renders a Study into a downloadable PDF screening report.

Kept separate from views.py so the PDF layout can change without touching
request handling, and reuses api/explanations.py so the wording in the PDF
never drifts from what the dashboard shows.
"""
import io

from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

from . import explanations

TEAL = colors.HexColor('#0F6E56')
LIGHT_GREY = colors.HexColor('#F6F6F6')
BORDER_GREY = colors.HexColor('#DDDDDD')

TIER_COLOR = {
    'Low': colors.HexColor('#0F6E56'),
    'Low-Moderate': colors.HexColor('#639922'),
    'Moderate': colors.HexColor('#BA7517'),
    'Moderate-High': colors.HexColor('#D85A30'),
    'High': colors.HexColor('#A32D2D'),
}


def _styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle('SpinovaTitle', parent=styles['Title'], textColor=TEAL, spaceAfter=2))
    styles.add(ParagraphStyle('SpinovaMeta', parent=styles['Normal'], textColor=colors.HexColor('#555555'), fontSize=9))
    styles.add(ParagraphStyle('SpinovaH2', parent=styles['Heading2'], textColor=colors.HexColor('#1A1A1A'), spaceBefore=10))
    styles.add(ParagraphStyle('SpinovaFinding', parent=styles['Normal'], fontSize=9.5, leading=13, spaceAfter=6))
    styles.add(ParagraphStyle('SpinovaFooter', parent=styles['Italic'], fontSize=8, textColor=colors.HexColor('#777777')))
    return styles


def build_study_pdf(study) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=18 * mm, bottomMargin=16 * mm, leftMargin=18 * mm, rightMargin=18 * mm,
        title=f'Spinova Report — Study {study.id}',
    )
    styles = _styles()
    elements = []

    elements.append(Paragraph('Spinova — Lumbar Spine Screening Report', styles['SpinovaTitle']))
    elements.append(Paragraph('Hospital-ready lumbar MRI screening for radiologists and spine specialists.', styles['SpinovaMeta']))
    elements.append(Spacer(1, 5 * mm))

    meta_rows = [
        ['Study ID', str(study.id)],
        ['Patient reference', study.patient_ref or 'Not provided'],
        ['Study uploaded', study.uploaded_at.strftime('%Y-%m-%d %H:%M UTC')],
        ['Report generated', timezone.now().strftime('%Y-%m-%d %H:%M UTC')],
        ['Model version', study.model_version or 'unknown'],
    ]
    meta_table = Table(meta_rows, colWidths=[45 * mm, 110 * mm])
    meta_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 9.5),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#555555')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 6 * mm))

    if study.is_valid_mri is False:
        elements.append(Paragraph('Study rejected by the MRI gatekeeper', styles['SpinovaH2']))
        elements.append(Paragraph(
            study.rejection_reason or 'The uploaded image does not resemble a lumbar spine MRI.',
            styles['SpinovaFinding'],
        ))
    else:
        tier = study.risk_tier or 'N/A'
        tier_color = TIER_COLOR.get(study.risk_tier, colors.black)
        elements.append(Paragraph('Risk summary', styles['SpinovaH2']))
        elements.append(Paragraph(
            f'<font color="{tier_color.hexval()}"><b>{tier}</b></font> — {study.risk_reason or ""}',
            styles['SpinovaFinding'],
        ))
        elements.append(Paragraph(
            'Draft tiering logic built for hospital review workflows; pending clinical validation.',
            styles['SpinovaMeta'],
        ))
        elements.append(Spacer(1, 4 * mm))

        predictions = list(study.predictions.all().order_by('level', 'condition'))

        elements.append(Paragraph('Findings by level and condition', styles['SpinovaH2']))
        data = [['Level', 'Condition', 'Severity', 'Confidence']]
        for p in predictions:
            severity = p.severity or ('Error' if p.error else '—')
            confidence = f'{p.confidence * 100:.0f}%' if p.confidence is not None else '—'
            data.append([p.level, p.condition, severity, confidence])

        table = Table(data, colWidths=[20 * mm, 78 * mm, 25 * mm, 25 * mm], repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), TEAL),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, -1), 8.5),
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_GREY),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_GREY]),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 6 * mm))

        elements.append(Paragraph('Findings — explanation', styles['SpinovaH2']))
        any_explained = False
        for p in predictions:
            if not p.severity:
                continue
            any_explained = True
            text = explanations.explain(p.condition, p.severity)
            elements.append(Paragraph(
                f'<b>{p.level} \u2014 {p.condition} ({p.severity}):</b> {text}',
                styles['SpinovaFinding'],
            ))
        if not any_explained:
            elements.append(Paragraph('No successfully screened findings to explain.', styles['SpinovaFinding']))

    elements.append(Spacer(1, 8 * mm))
    elements.append(Paragraph(
        'This tool supports review; it does not replace the radiologist\u2019s read. '
        'Risk tiering and per-finding explanations are a draft rule set pending clinical validation.',
        styles['SpinovaFooter'],
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer
