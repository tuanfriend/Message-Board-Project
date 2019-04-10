// Require the Express Module
var express = require('express');
// Create an Express App
var app = express();

const flash = require('express-flash');
app.use(flash());

//Session
var session = require('express-session');
app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/messageboard');

const CommentSchema = new mongoose.Schema({
    cmname: { type: String, required: [true, "Comment must be have name"] },
    cmcontent: { type: String, required: [true, "Comment must have content"] },
}, { timestamps: true })

const MessSchema = new mongoose.Schema({
    mename: { type: String, required: [true, "Message must have a name"], minlength: [2, "Name must have at least 3 characters"] },
    mecontent: { type: String, required: [true, "Message must have content"] },
    comments: [CommentSchema]
}, { timestamps: true })

var Comment = mongoose.model('Comment', CommentSchema);
var Message = mongoose.model('Message', MessSchema);



// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');
// Integrate body-parser with our App
app.use(bodyParser.urlencoded({ extended: true }));
// Require path
var path = require('path');
// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');
// Routes
// Root Request
app.get('/', function (req, res) {
    // This is where we will retrieve the users from the database and include them in the view page we will be rendering.

    Message.find({}, function (err, allmess) {
        // Retrieve an array of users
        if (err) {
            console.log(err);
        }
        else {
            res.render('index', { allmess: allmess });
        }
        // This code will run when the DB is done attempting to retrieve all matching records to {}
    })
})
// Add new message
app.post('/btmess', function (req, res) {
    console.log("POST DATA", req.body);
    // This is where we would add the user from req.body to the database.
    var newmess = new Message({ mename: req.body.mename, mecontent: req.body.mecontent });
    newmess.save(function (err) {
        if (err) {
            // if there is an error upon saving, use console.log to see what is in the err object 
            console.log("We have an error!", err);
            // adjust the code below as needed to create a flash message with the tag and content you would like
            for (var key in err.errors) {
                req.flash('addmess', err.errors[key].message);
            }
            // redirect the user to an appropriate route
            res.redirect('/');
        }
        else {
            res.redirect('/');
        }
    });
})

app.post('/btcomment/:id', function (req, res) {
    // This is where we would add the user from req.body to the database.
    var newcm = new Comment({ cmname: req.body.cmname, cmcontent: req.body.cmcontent });

    newcm.save(function (err) {
        if (err) {
            // if there is an error upon saving, use console.log to see what is in the err object 
            console.log("We have an error!", err);
            // adjust the code below as needed to create a flash message with the tag and content you would like
            for (var key in err.errors) {
                req.flash('addcm', err.errors[key].message);
            }
            // redirect the user to an appropriate route
            res.redirect('/');
        }
        else {
            Message.findOneAndUpdate({ _id: req.params.id }, { $push: { comments: newcm } }, function (err, data) {
                if (err) {
                    // handle the error from trying to update the user
                    console.log(err);
                }
                else {
                    // it worked! How shall we celebrate?
                    console.log(newcm);
                    res.redirect("/");
                }
            })
        }
    });

})

// Setting our Server to Listen on Port: 8000
app.listen(8000, function () {
    console.log("listening on port 8000");
})