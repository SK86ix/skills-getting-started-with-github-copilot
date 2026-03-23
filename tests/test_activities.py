def test_get_activities_returns_all_activities(client):
    response = client.get("/activities")

    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, dict)
    assert "Chess Club" in payload


def test_get_activities_item_has_expected_shape(client, known_activity_name):
    response = client.get("/activities")

    assert response.status_code == 200
    activity = response.json()[known_activity_name]
    assert set(activity.keys()) == {
        "description",
        "schedule",
        "max_participants",
        "participants",
    }
