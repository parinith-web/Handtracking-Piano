import { useEffect, useRef } from "react"
import { startHandTracking } from "../handTracking"

type CameraFeedProps = {
    onResults: (results: any) => void
}

export default function CameraFeed({ onResults }: CameraFeedProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const onResultsRef = useRef(onResults)

    // Keep the callback ref up to date without re-running useEffect
    useEffect(() => {
        onResultsRef.current = onResults
    }, [onResults])

    useEffect(() => {
        let stream: MediaStream | null = null

        async function initCamera() {
            if (!videoRef.current) return

            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 30 },
                    facingMode: 'user',
                },
            })

            videoRef.current.srcObject = stream

            // Pass a stable wrapper that delegates to the latest callback
            startHandTracking(videoRef.current, (results: any) => {
                onResultsRef.current(results)
            })
        }

        initCamera()

        // Cleanup: stop all tracks when the component unmounts
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop())
            }
        }
    }, [])

    return (
        <div className="absolute inset-0 overflow-hidden">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                }}
            />
            {/* Dark overlay gradient matching original design */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </div>
    )
}