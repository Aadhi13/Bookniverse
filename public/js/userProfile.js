let userId;
function editName(user_Id) {
    userId = user_Id;
    document.getElementById("nameField").disabled = false;
    $('#editNameButton').addClass('d-none');
    $('#cancelButton').removeClass('d-none');
    $('#saveButton').removeClass('d-none');
}

function cancelEdit() {
    document.getElementById("nameField").disabled = true;
    $('#editNameButton').removeClass('d-none');
    $('#cancelButton').addClass('d-none');
    $('#saveButton').addClass('d-none');
}

function editNameSave() {
    let inputData = document.getElementById("nameField").value;
    $.ajax({
        url: '/editName',
        data: {
            userId: userId,
            Name: inputData
        },
        method: 'post',
        success: (response) => {
            document.getElementById('userName').innerHTML = inputData;
        }
    })
    document.getElementById("nameField").disabled = true;
    $('#editNameButton').removeClass('d-none');
    $('#cancelButton').addClass('d-none');
    $('#saveButton').addClass('d-none');
}