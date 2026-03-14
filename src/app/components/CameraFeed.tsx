import { useEffect, useRef } from "react"
import { startHandTracking } from "../handTracking"

type CameraFeedProps = {
    onResults: (results: any) => void
}

export default function CameraFeed({ onResults }: CameraFeedProps) {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        async function initCamera() {
            if (!videoRef.current) return

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            })

            videoRef.current.srcObject = stream

            startHandTracking(videoRef.current, onResults)
        }

        initCamera()
    }, [])

    return (
        <video
            ref={videoRef}
            style={{ width: 250 }}
            autoPlay
            playsInline
            muted
        />
    )
}