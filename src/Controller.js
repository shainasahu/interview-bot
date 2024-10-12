import { useState } from 'react'
import Title from "./Title"
import RecordMessage from './RecordMessage'
import axios from "axios"
import { createClient } from "@deepgram/sdk";
import { LiveTranscriptionEvents } from "@deepgram/sdk";

function Controller() {
    const [isLoading, setIsLoading] = useState(false)
    const [messages, setMessages] = useState([])
    const [myHeaders, setMyHeaders] = useState({
        myHeader: "",
        chatHeader: "",
        count: -2
    })

    //creating blob
    const createBlobUrl = (data) => {
        const blob = new Blob([data], {type: "audio/mpeg"})
        const url = window.URL.createObjectURL(blob)
        return url
    }

    //handleStop function will retrive user audio, GPT audio, store it and play it
    const handleStop = async (blobUrl) => {
        setIsLoading(true)
        const myMessage = { sender: "Me", blobUrl}
        const messagesArr = [...messages, myMessage]

        fetch(blobUrl).then((res) => res.blob()).then(async (blob) => {
            const formData = new FormData()
            formData.append("file", blob, "myFile.wav")

            await axios.post("http://localhost:8000/post-audio", formData, {
                headers: {"Content-Type": "audio/mpeg"},
                responseType: "arraybuffer",
            }).then((res) => {
                const blob = res.data
                const audio = new Audio()
                audio.src = createBlobUrl(blob)
                
                //headers contain the message text
                const headers = res.headers
                const messageText = JSON.parse(headers["x-text-content"])
               
                const gptMessage = { sender: "GPT", blobUrl: audio.src}
                messagesArr.push(gptMessage)
                setMessages(messagesArr)

                editHeaders(messageText)
                setIsLoading(false)
                audio.play()
            }).catch((err) => {
                console.error(err.message)
                setIsLoading(false)
            })
        })

        function editHeaders(props) {
            setMyHeaders(prevHeaders => ({
                myHeader: props.text,
                chatHeader: props.characters,
                count: prevHeaders.count+2 
            }))
        }

    }
    
    return (
        <div className='h-screen overflow-y-hidden bg-gray-800'>
            <Title setMessages={setMessages}/>
            <div className='flex flex-col justify-between h-full overflow-y-scroll pb-96'>
                {/*Conversation*/}
                <div className='mt-5 px-5'>
                    {messages.map((audio, index) => {
                        return (
                            <div key={index + audio.sender} className={"flex flex-col " + (audio.sender === "GPT" && "flex items-end")}>
                                {/*Sender*/}
                                <div className='mt-4'>
                                    <p className={audio.sender === "GPT" ? "text-right mr-2 font-bold text-white" : "text-left ml-2 font-bold text-white"}>
                                        {audio.sender + ":"}
                                    </p>
                                    {audio.sender === "Me" && myHeaders.count == index && <p className={"text-left ml-2 text-white"}>{myHeaders.myHeader}</p>}
                                    {audio.sender === "GPT" && myHeaders.count+1 == index && <p className={"text-right mr-2 text-white"}>{myHeaders.chatHeader}</p>}
                                    {audio.sender === "You" && <p className='text-black'>{index}</p>}
                                    {/*Audio Message*/}
                                    <audio id="player" src={audio.blobUrl} className='appearance-none' controls/>
                                </div>
                            </div>
                        )
                    })}

                    {messages.length === 0 && !isLoading && (
                        <div className='text-center font-light mt-10 italic text-white'>
                            Say hi to the interviewer...
                        </div>
                    )}

                    {isLoading && (
                        <div className='text-center font-light mt-10 italic animate-pulse text-white'>
                            The interviewer is thinking...
                        </div>
                    )}

                </div>
                {/*Recorder*/}
                <div className='fixed bottom-0 w-full py-6 text-center bg-gray-900'>
                    <div className='flex justify-center items-center w-full '>
                        <RecordMessage handleStop={handleStop}/>
                    </div>
                </div>
            </div>
        </div>
    )
    
}

export default Controller