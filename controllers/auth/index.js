import bcrypt from "bcrypt";
import User from "../../Schema/User.js";
import { generateUsername, formatDataToSend } from "../../helpers/utils.js";
import { getAuth } from "firebase-admin/auth";

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // Validates email to include @ symbol and a valid domain
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // Validates password with 6 - 20 characters, 1 uppercase letter and 1 lowercase letter

/* 
    @title Sign Up
    @route POST /api/auth/signup
    @desc Sign up user
    @access Public
*/
const signUp = (req, res) => {
  const { fullName, email, password } = req.body;

  // Validating data from client
  if (fullName.length < 3) {
    return res.status(403).json({
      error: "Full name must be at least 3 characters long",
    });
  }

  if (!email.length) {
    return res.status(403).json({
      error: "Please enter an email",
    });
  }

  if (!emailRegex.test(email)) {
    return res.status(403).json({
      error: "Email is invalid",
    });
  }

  // Hash password
  bcrypt.hash(password, 10, async (err, hashedPassword) => {
    const username = await generateUsername(email);

    // Create a user
    let user = await new User({
      personalInfo: {
        fullName,
        email,
        password: hashedPassword,
        username,
      },
    });

    await user
      .save()
      .then((userInfo) => {
        return res.status(200).json(formatDataToSend(userInfo));
      })
      .catch((err) => {
        if (err.code === 11000) {
          return res.status(500).json({
            error: `Email '${email}' already exists`,
          });
        }
        res.status(500).json({
          error: err.message,
        });
      });
  });

  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letter",
    });
  }
};

/* 
    @title Sign In
    @route POST /api/auth/signin
    @desc Sign in user
    @access Public
*/
const signIn = async (req, res) => {
  const { email, password } = req.body;

  // Check if the email exists in the db
  await User.findOne({
    "personalInfo.email": email,
  })
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          error: `The email '${email}' was not found.`,
        });
      }

      if (!user.googleAuth) {
        // Check if the password is correct
        bcrypt.compare(password, user.personalInfo.password, (err, result) => {
          if (err) {
            return res.status(403).json({
              error: "Something went wrong while logging in, please try again!",
            });
          }

          if (!result) {
            return res.status(403).json({
              error: "Incorrect password",
            });
          } else {
            return res.status(200).json(formatDataToSend(user));
          }
        });
      } else {
        return res.status(403).json({
          error:
            "Account was created with google. Please try logging in with google.",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({
        error: err.message,
      });
    });
};

/* 
    @title Google authentication
    @route POST /api/auth/google-auth
    @desc Sign in user using google authentication
    @access Public
*/
const googleAuthentication = async (req, res) => {
  let { access_token } = req.body;

  getAuth()
    .verifyIdToken(access_token)
    .then(async (decodedUser) => {
      let { email, name, picture } = decodedUser;

      picture = picture.replace("s96-c", "s384-c");

      let user = await User.findOne({ "personalInfo.email": email })
        .select(
          "personalInfo.fullName personalInfo.username personalInfo.profileImg googleAuth"
        )
        .then((doc) => doc || null)
        .catch((err) =>
          res.status(500).json({
            error: err.message,
          })
        );

      if (user) {
        if (!user.googleAuth) {
          return res.status(400).json({
            error:
              "This user was signed up without google. Please log in with password to access your account.",
          });
        }
      } else {
        let username = await generateUsername(email);
        user = new User({
          personalInfo: {
            fullName: name,
            email,
            profileImg: picture,
            username,
          },
          googleAuth: true,
        });

        await user
          .save()
          .then((u) => {
            user = u;
          })
          .catch((err) =>
            res.status(500).json({
              error: err.message,
            })
          );
      }

      return res.status(200).json(formatDataToSend(user));
    })
    .catch((err) => {
      return res.status(500).json({
        error:
          "Failed to authenticate you with google. Please try again with another google account.",
      });
    });
};

export { signUp, signIn, googleAuthentication };
