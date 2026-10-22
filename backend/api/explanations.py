"""
Short, plain-language explanations for each (condition, severity) pair the
severity model can output. Used to annotate every finding returned by
`predict_study` (see serializers.PredictionSerializer.get_explanation) and
reused verbatim in the PDF report (see report.py), so the two stay in sync.

These are drafted for clinician review, same as the risk-tier rule in
inference.compute_risk_tier — see README "Next steps" #4.
"""

CONDITION_BLURBS = {
    'Spinal Canal Stenosis': (
        'Narrowing of the central spinal canal, which can compress the '
        'spinal cord or cauda equina.'
    ),
    'Left Neural Foraminal Narrowing': (
        'Narrowing of the left-side opening where a nerve root exits the spine.'
    ),
    'Right Neural Foraminal Narrowing': (
        'Narrowing of the right-side opening where a nerve root exits the spine.'
    ),
    'Left Subarticular Stenosis': (
        'Narrowing of the left lateral recess, near the base of the nerve root.'
    ),
    'Right Subarticular Stenosis': (
        'Narrowing of the right lateral recess, near the base of the nerve root.'
    ),
}

# Severity-specific language, written to be concatenated after a condition
# blurb: "<condition blurb> <severity clause>"
SEVERITY_CLAUSES = {
    'Normal/Mild': (
        'At this level the model found no significant narrowing — findings '
        'are within normal limits or reflect only mild degenerative change '
        'that would not usually need intervention on its own.'
    ),
    'Moderate': (
        'At this level the model found moderate narrowing — some '
        'compression of the canal or nerve pathway. This typically '
        'warrants clinical correlation with the patient\u2019s symptoms and '
        'follow-up review.'
    ),
    'Severe': (
        'At this level the model found severe narrowing — substantial '
        'compression of the canal or nerve pathway. Findings at this grade '
        'often warrant prompt specialist review.'
    ),
}

SEVERITY_SHORT_LABEL = {
    'Normal/Mild': 'No significant narrowing detected.',
    'Moderate': 'Moderate compression detected — correlate clinically.',
    'Severe': 'Severe compression detected — recommend prompt review.',
}


def explain(condition, severity):
    """Full one-liner combining what the condition is + what this severity
    grade means. Returns None if there's no severity to explain (e.g. the
    point errored out)."""
    if not severity:
        return None
    condition_text = CONDITION_BLURBS.get(condition, condition)
    severity_text = SEVERITY_CLAUSES.get(severity, '')
    return f'{condition_text} {severity_text}'.strip()


def short_summary(severity):
    """Just the severity-grade takeaway, no condition anatomy — used where
    space is tight (table row, badge tooltip)."""
    if not severity:
        return None
    return SEVERITY_SHORT_LABEL.get(severity, severity)
