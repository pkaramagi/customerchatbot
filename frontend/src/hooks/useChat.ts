import { useState } from "react";
import { ChatMessage } from "../types";

function useChat(){
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    
    const sendMessage = async(message:string) =>{
        
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            text: message,
            sender: 'user',
            timestamp: new Date(),
        }

        setMessages((prev)=> [...prev, userMessage])

        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({message})
            });

            if(response.ok){
                const data = await response.json();
                const systemMessage: ChatMessage = {
                    id: Date.now().toString(),
                    text: data.message,
                    sender: 'system',
                    timestamp: new Date(),
                }
                setMessages((prev)=> [...prev, systemMessage])

            const reader = response.body?.getReader();
            if(!reader){
                throw new Error('No reader available');
            }

            while(true){
                const {done, value} = await reader.read();
                if(done){
                    break;
                }
                const chunk = new TextDecoder().decode(value);
                setMessages((prev)=> 
                    prev.map((message)=> 
                        message.id === systemMessage.id 
                ? {...message, text: message.text + chunk}
                : message
                )
            );
            }
            }

            
        }catch(error){
            console.error('Error Sending Message:', error);
        }
    };
    return {messages, sendMessage};
};

export default useChat;