from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Study',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('patient_ref', models.CharField(blank=True, max_length=64)),
                ('image', models.FileField(upload_to='studies/')),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('risk_tier', models.CharField(blank=True, max_length=32)),
                ('risk_reason', models.CharField(blank=True, max_length=255)),
                ('model_version', models.CharField(blank=True, max_length=64)),
                ('is_valid_mri', models.BooleanField(blank=True, null=True)),
                ('rejection_reason', models.CharField(blank=True, max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='Prediction',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('level', models.CharField(max_length=16)),
                ('condition', models.CharField(max_length=64)),
                ('severity', models.CharField(blank=True, max_length=16, null=True)),
                ('confidence', models.FloatField(blank=True, null=True)),
                ('error', models.CharField(blank=True, max_length=64, null=True)),
                ('study', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='predictions', to='api.study')),
            ],
        ),
        migrations.CreateModel(
            name='LevelPoint',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('level', models.CharField(max_length=16)),
                ('condition', models.CharField(max_length=64)),
                ('x', models.FloatField()),
                ('y', models.FloatField()),
                ('study', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='points', to='api.study')),
            ],
        ),
    ]
