const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');

// Send mail from test account
const signup = async(req,res)=>{
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });

      let meassage = {
        from: '"Club Nights" <foo@example.com>', // sender address
        to: "bar@example.com, baz@example.com", // list of receivers
        subject: "Congrats! Your Club Nights verified success🎉", // Subject line
        text: "?", // plain text body
        html: "<b>Hello world?</b>", // html body
      };
      transporter.sendMail(meassage)
      .then((info)=>{
        return res.status(201).json({msg:"You should recieve an email",info:info.messageId,preview : nodemailer.getTestMessageUrl(info)})
      })
      .catch((err) => res.status(500).json({err}))
      
    // res.status(200).json("Signup success");
}

//send mail from gmail account
const getbill = (req,res)=>{
     const {userEmail} = req.body;
    let config = {
        service  : 'gmail',
        auth:{
            //use env
            user :'oppoa5sraj@gmail.com',
            pass:'fmbrmnfibiikiknt' //first on 2step verification on Google account, then go to app password option then create pass and put here...
        }
    };

    let transporter = nodemailer.createTransport(config)
    let MailGenerator = new Mailgen({
      theme:"default",
      product: {
       name: "Mailgen",
      link:"https://mailgen.js/"
 } })
    let response = {
      body:{
        name:"Daily tution",
        intro:"Your bill has arrived!",
        table:{
          data:[
            {
              item:"Nodemailer Stack Book",
              description :"A backend app",
              price:"$10.99"
            }
          ]
        },
        outro:"Looking forward to do more buisnesses"
      }
    }
    let mail = MailGenerator.generate(response)
    let message = {
      from: "YourEmail@gmail.com",
      to:userEmail,
      subject:"Place order",
      html:mail

    }
    transporter.sendMail(message)
    .then(()=>{
      return res.status(201).json({
        msg:"You should recieve an email"
      })
    })
    .catch((err)=>{
      res.status(500).json({err});
    })
    // res.status(200).json("Login success");
}

module.exports = {
    signup: signup,
    getbill: getbill
}