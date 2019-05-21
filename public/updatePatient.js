function updatePatient(id){
    $.ajax({
        url: '/patients/' + id,
        type: 'PUT',
        data: $('#update-patient').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};