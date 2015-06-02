module.exports = function(mysql) {
    var appDB = {
        init: function(){
            var pool  = mysql.createPool({
               host     : 'localhost',
                user     : 'root',
                password : '',
                database : 'eztidy'
            });
            return pool;
        },//init
    }
   return appDB;
}
