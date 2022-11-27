const {Router}= require('express');
const cartController=require('../controller/cart.controller');
const auth = require('../middleware/auth');


const router=Router();

router.use(auth);

router.get("/",cartController.fetch);
router.get("/:value",cartController.fetch);
router.post("/",cartController.create);
router.delete('/:value',cartController.delete)



module.exports=router;