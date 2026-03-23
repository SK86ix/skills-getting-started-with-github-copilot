def test_unregister_success_removes_participant(client, known_activity_name):
    existing_email = "michael@mergington.edu"

    response = client.delete(
        f"/activities/{known_activity_name}/signup",
        params={"email": existing_email},
    )

    assert response.status_code == 200
    assert response.json() == {
        "message": f"Unregistered {existing_email} from {known_activity_name}"
    }

    activities_response = client.get("/activities")
    participants = activities_response.json()[known_activity_name]["participants"]
    assert existing_email not in participants


def test_unregister_unknown_activity_returns_404(
    client, unknown_activity_name, new_student_email
):
    response = client.delete(
        f"/activities/{unknown_activity_name}/signup",
        params={"email": new_student_email},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"


def test_unregister_not_signed_up_returns_404(
    client, known_activity_name, new_student_email
):
    response = client.delete(
        f"/activities/{known_activity_name}/signup",
        params={"email": new_student_email},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Student is not signed up for this activity"


def test_unregister_missing_email_returns_422(client, known_activity_name):
    response = client.delete(f"/activities/{known_activity_name}/signup")

    assert response.status_code == 422
