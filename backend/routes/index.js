const { Router } = require("express");
const userRouter = require("./user");
const blogRouter = require("./blog");
const router = Router();

router.use("/user", userRouter);
router.use("/blog", blogRouter);

module.exports = router;