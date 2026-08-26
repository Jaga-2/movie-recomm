import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


def test_load_data_works_when_cwd_is_elsewhere(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    import app

    movies = app.load_data()

    assert not movies.empty
    assert 'title' in movies.columns
    assert 'genres' in movies.columns
    assert 'overview' in movies.columns
