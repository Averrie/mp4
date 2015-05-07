(function(){/*
if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
*/

// simple-todos.js
Users = new Mongo.Collection("users");
Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
    // This code only runs on the client
    Session.setDefault('existErrors', false);

    Template.existErrors.helpers({
        existErrors: function () {
            return Session.get('existErrors');
        }
    });

    Template.users.helpers({
        users: function () {
            return Users.find({}, {sort: {createdAt: -1}});
        }
    });

    Template.users.events({
        "submit form": function (event) {
            // This function is called when the new-task form is submitted

            var email = event.target.email.value;

            var name = event.target.name.value;

            /*
             if (name == "") {
             Errors.nameError = true;
             return;
             }


             var reg = /[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4}/;
             if (!reg.test(email)) {
             console.log("Email format is not valid");
             return;
             }
             */

            if (Users.findOne({email: email})) {
                Session.set('existErrors', true);

                // Clear form
                event.target.email.value = "";
                event.target.name.value = "";

                // Prevent default form submit
                return false;
            }
            else {
                Session.set('existErrors', false);
            }

            Users.insert({
                name: name,
                email: email,
                dateCreated: new Date(), // current time
                pendingTasks: [],
                _id: new Meteor.Collection.ObjectID()._str
            });

            // Clear form
            event.target.email.value = "";
            event.target.name.value = "";

            // Prevent default form submit
        }
    });

    Template.user.events({
        "click .toggle-checked": function () {
            // Set the checked property to the opposite of its current value
            Users.update(this._id, {$set: {checked: !this.checked}});
        },
        "click .delete": function () {
            Users.remove(this._id);
        }
    });

    Session.setDefault('skip', 0);
    Session.setDefault('disabledPrev', false);
    Session.setDefault('disabledNext', false);
    Session.setDefault('query', {completed: false});
    Session.setDefault('sort', {deadline: 1});
    Session.setDefault('asc', true);
    Session.setDefault('desc', false);
    Session.setDefault('pending', true);
    Session.setDefault('completed', false);
    Session.setDefault('all', false);
    Session.setDefault('name', true);
    Session.setDefault('username', false);
    Session.setDefault('dateCreated', false);
    Session.setDefault('deadline', false);
    Session.setDefault('showCompleted', false);

    Tracker.autorun(function() {
        Template.tasks.helpers({
            tasks: function () {
                return Tasks.find(Session.get("query"), {limit: 10, skip: Session.get("skip"), sort: Session.get("sort")});
            },
            enabledPrev: function () {
                return Session.get('enabledPrev');
            },
            disabledNext: function () {
                return Session.get('disabledNext');
            },
            asc:function () {
                return Session.get('asc');
            },
            desc:function () {
                return Session.get('desc');
            },
            pending:function () {
                return Session.get('pending');
            },
            completed:function () {
                return Session.get('completed');
            },
            all:function () {
                return Session.get('all');
            },
            name:function () {
                return Session.get('name');
            },
            username:function () {
                return Session.get('username');
            },
            dateCreated:function () {
                return Session.get('dateCreated');
            },
            deadline:function () {
                return Session.get('deadline');
            }
        });

        if (Session.get('skip') + 10 >= Tasks.find(Session.get("query")).count()) {
            Session.set('disabledNext', true);
        }
        else{
            Session.set('disabledNext', false);
        }
    });


    Template.tasks.events({
        "submit form": function (event) {
            // This function is called when the new-task form is submitted

            var name = event.target.name.value;
            var description = event.target.description.value;
            var deadline = event.target.deadline.value;
            var split = event.target.assigned.value.split(",");
            console.log("assigned is" + event.target.assigned.value);
            var assignedUser = split[0];
            var assignedUserName = split[1];
            console.log("assignedUser is" + assignedUser);
            console.log("assignedUserName is" + assignedUserName);
            var id = new Meteor.Collection.ObjectID()._str;

            var unassigned = true;
            if (assignedUser == "") {
                unassigned = true;
            }
            else {
                unassigned = false;
            }

            Tasks.insert({
                name: name,
                description: description,
                deadline: deadline,
                completed: false,
                assignedUser: assignedUser,
                assignedUserName: assignedUserName,
                dateCreated: new Date(), // current time
                _id: id,
                unassigned: unassigned
            });

            if (assignedUser != "") {
                Users.update(assignedUser, {$push: {pendingTasks: id}});
            }

            console.log("id is " + id);


            // Clear form
            event.target.name.value = "";
            event.target.description.value = "";
            event.target.deadline.value = "";
            event.target.assigned.value = "";

            // Prevent default form submit
        },
        "click .previous": function (){
            if (Session.get('skip') >= 10) {
                Session.set('skip', Session.get('skip') - 10);
            }

            if (Session.get('skip') < 10) {
                Session.set('enabledPrev', false);
            }
            else {
                Session.set('enabledPrev', true);
            }

            if (Session.get('skip') + 10 < Tasks.find(Session.get("query")).count()) {
                Session.set('disabledNext', false);
            }
            else{
                Session.set('disabledNext', true);
            }
            console.log("previous");
            console.log(Session.get('skip'));
        },
        "click .next": function (){
            if (Session.get('skip') + 10 < Tasks.find(Session.get("query")).count()) {
                Session.set('skip', Session.get('skip') + 10);
            }

            if (Session.get('skip') + 10 >= Tasks.find(Session.get("query")).count()) {
                Session.set('disabledNext', true);
            }
            else{
                Session.set('disabledNext', false);
            }

            if (Session.get('skip') >= 10) {
                Session.set('enabledPrev', true);
            }
            else {
                Session.set('enabledPrev', false);
            }
            console.log("next");
            console.log(Session.get('skip'));
            console.log(Tasks.find({}).count());

        },
        "click #pending": function () {
            Session.set('query', {completed: false});
            Session.set('skip', 0);
            Session.set('enabledPrev', false);
            Session.set('pending', true);
            Session.set('completed', false);
            Session.set('all', false);
            console.log("set query to pending (false)")
        },
        "click #completed": function () {
            Session.set('query', {completed: true});
            Session.set('skip', 0);
            Session.set('enabledPrev', false);
            Session.set('completed', true);
            Session.set('all', false);
            Session.set('pending', false);
            console.log("set query to completed (true)")
        },
        "click #all": function () {
            Session.set('query', {});
            Session.set('skip', 0);
            Session.set('enabledPrev', false);
            Session.set('all', true);
            Session.set('pending', false);
            Session.set('completed', false);
            console.log('set query to all ("")')

        },
        "change #sortOption": function () {
            if (event.target.value == "name") {
                Session.set('sort', {name: Session.get('sequence')});
                Session.set('name', true);
                Session.set('username', false);
                Session.set('dateCreated', false);
                Session.set('deadline', false);
                console.log(Session.get('sort'));
            }
            else if (event.target.value == "username") {
                Session.set('sort', {assignedUserName: Session.get('sequence')});
                Session.set('name', false);
                Session.set('username', true);
                Session.set('dateCreated', false);
                Session.set('deadline', false);
                console.log(Session.get('sort'));
            }
            else if (event.target.value == "date created") {
                Session.set('sort', {dateCreated: Session.get('sequence')});
                Session.set('name', false);
                Session.set('username', false);
                Session.set('dateCreated', true);
                Session.set('deadline', false);
                console.log(Session.get('sort'));
            }
            else {
                Session.set('sort', {deadline: Session.get('sequence')});
                Session.set('name', false);
                Session.set('username', false);
                Session.set('dateCreated', false);
                Session.set('deadline', true);
                console.log(Session.get('sort'));
            }
        },
        "click #ASC_btn": function (event, template) {
            Session.set('sequence', 1);
            Session.set('asc', true);
            Session.set('desc', false);
            console.log(template.find("#sortOption").value);
            if (template.find("#sortOption").value == "name") {
                Session.set('sort', {name: Session.get('sequence')});
                console.log(Session.get('sort'));
            }
            else if (template.find("#sortOption").value == "username") {
                Session.set('sort', {assignedUserName: Session.get('sequence')});
                console.log(Session.get('sort'));
            }
            else if (template.find("#sortOption").value == "date created") {
                Session.set('sort', {dateCreated: Session.get('sequence')});
                console.log(Session.get('sort'));
            }
            else {
                Session.set('sort', {deadline: Session.get('sequence')});
                console.log(Session.get('sort'));
            }
        },
        "click #DESC_btn": function (event, template) {
            Session.set('sequence', -1);
            Session.set('desc', true);
            Session.set('asc', false);

            console.log("!!!!!!!!!" + Session.get('desc'));
            if (template.find("#sortOption").value == "name") {
                Session.set('sort', {name: Session.get('sequence')});
                console.log(Session.get('sort'));
            }
            else if (template.find("#sortOption").value == "username") {
                Session.set('sort', {assignedUserName: Session.get('sequence')});
                console.log(Session.get('sort'));
            }
            else if (template.find("#sortOption").value == "date created") {
                Session.set('sort', {dateCreated: Session.get('sequence')});
                console.log(Session.get('sort'));
            }
            else {
                Session.set('sort', {deadline: Session.get('sequence')});
                console.log(Session.get('sort'));
            }
        }
    });

    Template.task.events({
        "click .toggle-checked": function () {
            // Set the checked property to the opposite of its current value
            Tasks.update(this._id, {$set: {completed: true}});
        },
        "click .delete": function () {
            Tasks.remove(this._id);
        }
    });

    Template.task.helpers({
        pending: function () {
            return Session.get("pending");
        }
    })


    Template.usersId.helpers({
        id: function () {
            return Session.get('userId');
        },

        data: function() {
            return Users.findOne({_id: Session.get('userId')});
        },

        pendingTasks: function () {
            return Tasks.find({assignedUser: Session.get('userId'), completed: false});
        },

        completedTasks: function () {
            return Tasks.find({assignedUser: Session.get('userId'), completed: true});
        },

        showCompleted: function () {
            return Session.get('showCompleted');
        }
    })

    Template.usersId.events({
        "click .toggle-checked": function () {
            Tasks.update(this._id, {$set: {completed: true}});
        },
        "click .showCompleted": function () {
            Session.set("showCompleted", !Session.get("showCompleted"));
        }
    })

    Template.tasksId.helpers({
        id: function () {
            return Session.get('taskId');
        },

        data: function() {
            return Tasks.findOne({_id: Session.get('taskId')});
        },

        users: function () {
            return Users.find({}, {sort: {name: 1}});
        },

        isSelected: function (option) {
            var temp = Tasks.findOne({_id: Session.get('taskId')}).assignedUser;
            console.log("successful" + option);
            return option === temp ? "" : false;
        }
    });

    Template.addTaskForm.helpers({
        users: function () {
            return Users.find({}, {sort: {name: 1}});
        }
    });

    Template.tasksId.events({

        "submit form": function (event, template) {

            // This function is called when the new-task form is submitted
            var name = event.target.name.value;
            var description = event.target.description.value;
            var deadline = event.target.deadline.value;
            var split = event.target.assignedOption.value.split(",");
            console.log("assigned is" + event.target.assignedOption.value);
            var assignedUser = split[0];
            var assignedUserName = split[1];
            console.log("assignedUser is" + assignedUser);
            console.log("assignedUserName is" + assignedUserName);
            var completed = false;
            if (event.target.completed.value == "true"){
                completed = true;
            }
            else {
                completed = false;
            };

            var unassigned = true;
            if (assignedUser == "") {
                unassigned = true;
            }
            else {
                unassigned = false;
            }

            Tasks.update(Session.get('taskId'),
                { $set:
                    {
                        name: name,
                        description: description,
                        deadline: deadline,
                        assignedUser: assignedUser,
                        assignedUserName: assignedUserName,
                        unassigned: unassigned,
                        completed: completed
                    }
                }
            );

            if (assignedUser != "") {
                Users.update(assignedUser, {$push: {pendingTasks: Session.get('taskId')}});
                console.log("try to assign user " +  Session.get('taskId'));
            }

            console.log("id is " + Session.get('taskId'));


            // Clear form
            event.target.name.value = "";
            event.target.description.value = "";
            event.target.deadline.value = "";
            event.target.assignedOption.value = "";

            console.log("try to update task");

            // Prevent default form submit
        },
        "click .completeTask": function () {
            Tasks.update(Session.get('taskId'), {$set: {completed: true}});
        }
    });
}

Router.route('/', function () {
    // render the Home template with a custom data context
    this.render('Home');
});

Router.route('/users');
Router.route('/tasks');
Router.route('/users/:id', {
    name: 'usersId',
    path: '/users/:_id',
    template: 'usersId',
    onBeforeAction: function () {
        this.render('usersId');
        Session.set('userId', this.params._id);
    }
});

Router.route('/tasks/:id', {
    name: 'tasksId',
    path: '/tasks/:_id',
    template: 'tasksId',
    onBeforeAction: function () {
        this.render('tasksId');
        Session.set('taskId', this.params._id);
    }
});

})();
