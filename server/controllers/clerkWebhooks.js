import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks =async (req,res) =>{
    try{
        const whook= new Webhook(process.env.CLERK_WEBHOOK_SECRET)

             
        const headers= {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature" : req.headers["svix-signature"],
        };

        console.log("absbxjsc");

        await whook.verify(JSON.stringify(req.body), headers)
           

        const {data,type} =req.body

       

            console.log(data);
            console.log(type);

        const userData= {
            _id: data.id,
               email: (data.email_addresses && data.email_addresses.length > 0)
                ? data.email_addresses[0].email_address
                : "",
            image: data.image_url,
        }

        switch (type) {
            case "user.created" : {
                     await User.create(userData);
                    break;

            }
             
             case "user.updated" : {
                    await User.findByIdAndUpdate(data.id, userData);
                    break;

            }

          case "user.deleted":{
    await User.findByIdAndDelete(data.id);
    break;
          
}


            default:
               
                break;
        }

        res.json({success: true, message: "Webhook Received"})

    } catch (error){
         console.error(error.message);
         res.json({success: false, message: error.message});
    }
}

export default clerkWebhooks;




