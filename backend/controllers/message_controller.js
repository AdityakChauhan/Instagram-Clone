export const sendMessage = async(req,res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const {message} = req.body;

        
    } catch (error) {
        console.log(error)
    }
}