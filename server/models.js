module.exports = function (bookshelf) {
    var User = bookshelf.Model.extend({
        tableName: 'users',

        initialize: function () {
            this.on('creating', this.set_admin);
        },

        set_admin: function () {
            var self = this;
            return bookshelf.knex('users').count().then(function (result) {
                if (result[0] && result[0].count == 0) {
                    console.log("Marking first user " + self.get("email") + " as admin");
                    self.set('is_admin', true);
                }
            });
        }
    });

    var Question = bookshelf.Model.extend({
        tableName: 'questions'
    });

    var Answer = bookshelf.Model.extend({
        tableName: 'answers'
    });
    
    var Hint = bookshelf.Model.extend({
        tableName: 'hints'
    });
    
    function leaders(req, res, next) {
        return bookshelf.knex('users').orderBy('points', 'desc')
                .select('*').then(function (rows) {
            res.json(rows);
        });
    }

    return {
        User: User,
        Question: Question,
        Answer: Answer,
        Hint: Hint,
        leaders: leaders
    };
};