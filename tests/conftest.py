from copy import deepcopy

import pytest
from fastapi.testclient import TestClient

import src.app as app_module


@pytest.fixture
def client():
    with TestClient(app_module.app) as test_client:
        yield test_client


@pytest.fixture(autouse=True)
def reset_activities_state():
    original_activities = deepcopy(app_module.activities)
    yield
    app_module.activities.clear()
    app_module.activities.update(deepcopy(original_activities))


@pytest.fixture
def known_activity_name():
    return "Chess Club"


@pytest.fixture
def unknown_activity_name():
    return "Unknown Activity"


@pytest.fixture
def new_student_email():
    return "newstudent@mergington.edu"
