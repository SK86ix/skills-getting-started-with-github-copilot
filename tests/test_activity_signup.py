def test_signup_success_adds_participant(client, known_activity_name, new_student_email):
    response = client.post(
        f"/activities/{known_activity_name}/signup",
        params={"email": new_student_email},
    )

    assert response.status_code == 200
    assert response.json() == {
        "message": f"Signed up {new_student_email} for {known_activity_name}"
    }

    activities_response = client.get("/activities")
    participants = activities_response.json()[known_activity_name]["participants"]
    assert new_student_email in participants


def test_signup_duplicate_participant_returns_400(client, known_activity_name):
    existing_email = "michael@mergington.edu"

    response = client.post(
        f"/activities/{known_activity_name}/signup",
        params={"email": existing_email},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Student already signed up"


def test_signup_unknown_activity_returns_404(
    client, unknown_activity_name, new_student_email
):
    response = client.post(
        f"/activities/{unknown_activity_name}/signup",
        params={"email": new_student_email},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"


def test_signup_missing_email_returns_422(client, known_activity_name):
    response = client.post(f"/activities/{known_activity_name}/signup")

    assert response.status_code == 422
