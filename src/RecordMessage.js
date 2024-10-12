import {ReactMediaRecorder} from "react-media-recorder"
import RecordIcon from "./RecordIcon"

function RecordMessage({handleStop}) {
    return (
        <ReactMediaRecorder
            audio
            onStop={handleStop}
            render={({status, startRecording, stopRecording}) => (
                <div>
                    <button onClick={status === "recording" ? stopRecording : startRecording } className="bg-white p-4 rounded-full">
                        <RecordIcon classText = {status === "recording" ? "animate-pulse text-red-500" : "text-black"}/>
                    </button>
                    <p className="mt-2 text-white font-light">{status}</p>
                </div>
            )}
        />
    )
}

export default RecordMessage