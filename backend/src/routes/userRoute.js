import express from "express";
import User from "../models/user.js";

const router = express.Router();

// Create or update user
router.post("/", async (req, res) => {
  try {
    const { uid, name, email, photoURL } = req.body;

    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({ uid, name, email, photoURL });
      await user.save();
    } else {
      // Update details if user already exists
      user.name = name;
      user.email = email;
      user.photoURL = photoURL;
      await user.save();
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
