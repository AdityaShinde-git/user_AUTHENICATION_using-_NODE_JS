const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const collection = require('./config');


const app = express();
//convert data into json format

app.use(express.json());
app.use(express.urlencoded({ extended: false }))




app.set('view engine', 'ejs');

//static file
app.use(express.static("public"));





app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});


function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();

}

 generateCode();


// Registerasation
app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        password: req.body.password,
        Mobile_number: req.body.num,
        Email: req.body.email,
        code:  generateCode(),
        codeAttempts: 0,
        isCodeLocked: false
    }
    // data signup validation (register)
   
    let conditionCount = 0;

    const existingUser = await collection.findOne({ name: data.name });
    if (existingUser) {
        res.send(`
                        <script>
                            alert('User already exists.Please choose a different username.');
                            window.history.back();
                        </script>`);

    }
    else {
        conditionCount++;
    }

    const existingnumber = await collection.findOne({ Mobile_number: data.Mobile_number });
    if (existingnumber) {
        res.send(`
                        <script>
                            alert('THis number is already registered in Database.Please use a different Number');
                            window.history.back();
                        </script>
                        `);

    }
    else {
        conditionCount++;
    }


    const existingEmail = await collection.findOne({ Email: data.Email });
    if (existingEmail) {
        res.send(`
                        <script>
                            alert('THis EMAIL ADDRESS is already registered in Database.Please use a different ADDRESS.');
                            window.history.back();
                        </script>
                        `);

    }
    else {
        conditionCount++;
    }

    console.log(conditionCount);
    if (conditionCount == 3) {
        //hash password using bcrypt
        const saltround = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltround);
        data.password = hashedPassword;
        // data enter in db
        const userdata = await collection.insertMany(data);
        console.log(userdata);
    }
    res.render("login");
    // data signup validation over (register)end

    // login user(fetch)
    app.post("/login", async (req, res) => {
        try {
            const check = await collection.findOne({ name: req.body.username });
            if (!check) {
                res.send(`
                        <script>
                            alert('user not found in database');
                            window.history.back();
                        </script>
                        `);
            }
            // comparing password hash to string
            const validPassword = await bcrypt.compare(req.body.password, check.password);
            if (validPassword) {

                res.render("home",);

            }
            else {
                res.send(`
                        <script>
                            alert('Invalid Password');
                            window.history.back();
                        </script>
                        `);
                    

            }
        }
        catch {
            res.send(`
                        <script>
                            alert('Invalid credntials');
                            window.history.back();
                        </script>
                        `);
        }
    });
    // login user(fetch) end






    //verfying code on home.ejs(post)

    app.post("/home", async (req, res) => {
        const { Ecode } = req.body;
        try {
            const codecheck = await collection.findOne({ code: data.code });
            if (!codecheck) {
                res.send("their has been some error in genrating code try with different crendentials");
            }
            // checking if any attempts left
            if (codecheck.isCodeLocked) {
                 res.send(`
                        <script>
                            alert('You have exhausted your attempts to enter the code.');
                            window.history.back();
                        </script>
                        `);
            }
            // if attempts left proced or stop above
            if (codecheck.codeAttempts >= 3) {
                codecheck.isCodeLocked = true;
                await codecheck.save();
                return res.status(403).send(`
                        <script>
                            alert('Maximum attempts reached. You can no longer enter the code.');
                            window.history.back();
                        </script>
                        `);
            }
            // logic of comparision
            const reqcode = Ecode;
            const rescode = codecheck.code;
            console.log(reqcode);
            console.log(rescode);
            // with if{} logic ends
            if (reqcode === rescode) {
                codecheck.codeAttempts = 0;
                
                await codecheck.save();
                res.send(`
                        <script>
                            alert('code verified successfully!');
                            window.history.back();
                        </script>
                        `);
            
            }
            else {
                codecheck.codeAttempts += 1;
                await codecheck.save();
                res.send(`
                        <script>
                            alert('Incorrect code. Attempts left: ${3 - codecheck.codeAttempts}');
                            window.history.back();
                        </script>
                        `);
                //return res.status(400).send(`Incorrect code. Attempts left: ${3 - codecheck.codeAttempts}`);



            }
            
        }
        catch {
            res.send("Invalid code ,account aborted");

        }
    });






})
//



const port = 5000;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
})