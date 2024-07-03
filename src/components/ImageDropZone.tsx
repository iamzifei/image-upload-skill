import { PhotoIcon } from "@heroicons/react/24/outline"
import axios from "axios"
import { useState } from "react"
import Dropzone from "react-dropzone"
import Input from "./Input"

type ImageDropZoneProps = {
  error?: string | null
  fileLimit?: number
}

const copyTextToClipboard = async (text: string) => {
  if ("clipboard" in navigator) {
    return await navigator.clipboard.writeText(text)
  } else {
    return document.execCommand("copy", true, text)
  }
}

const ImageDropZone = ({ fileLimit = 10 }: ImageDropZoneProps) => {
  const [uploading, setUploading] = useState<boolean>(false)
  const [token, setToken] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [uploadedImg, setUploadedImg] = useState<string>("")
  const handleDrop = async (acceptedFiles: File[]) => {
    setError("")
    if (acceptedFiles.length === 0) {
      setError("Please select an image first!")
      return
    }

    const selectedFile = acceptedFiles[0]
    const fileName = selectedFile.name

    setUploading(true)

    const response = await fetch(`/v1/discord/image/upload/url`, {
      method: "POST",
      // credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        filename: Date.now() + fileName,
      }),
    })

    if (response.status >= 500) {
      setError("Error uploading image")
      return
    }

    const { path, token: signedToken, signedUrl, message } = await response.json()
    if (message) {
      setError(message)
      setUploading(false)
      return
    }
    const uploadRes = await axios.put(signedUrl, selectedFile, {
      headers: {
        "Content-Type": selectedFile.type, // Adjust the content type as needed
        Authorization: `Bearer ${signedToken}`,
      },
    })

    if (uploadRes.status === 200) {
      const url = `https://image.mymidjourney.ai/storage/v1/object/public/image/${encodeURIComponent(path)}`
      setUploadedImg(url)
    }
    setUploading(false)
  }

  return (
    <div className="w-96 space-y-5">
      <Input onChange={(e) => setToken(e.target.value)} value={token} name="token" label="MyMidjourney Token" />
      <p className="text-lg font-bold text-red-600">Note that we will only preserve your image for 24 hours!</p>
      <Dropzone
        onDrop={handleDrop}
        accept={{
          "image/*": [".png", ".gif", ".jpg", ".jpeg"],
        }}
        multiple={false}
        disabled={uploading}
        maxSize={fileLimit * 1024 * 1024}
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps()}
            className={`flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-4 dark:border-gray-50/25 h-[300px] items-center ${
              uploading ? "cursor-default" : "cursor-pointer"
            }`}
          >
            <div className="flex flex-col items-center text-center w-64">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" />
              {uploading ? (
                <div className="mt-4 flex text-sm leading-6">
                  <p className="text-sm font-semibold text-gray-500">
                    <svg
                      aria-hidden="true"
                      role="status"
                      className="mr-3 inline h-4 w-4 animate-spin text-slate-500 dark:text-slate-400"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="#E5E7EB"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentColor"
                      />
                    </svg>
                    Uploading...
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mt-4 flex text-sm leading-6">
                    <label className="relative rounded-md font-semibold text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2 hover:text-primary-500">
                      <span>Select a image file</span>
                      <input {...getInputProps()} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Dropzone>
      {uploadedImg && (
        <div>
          <p>Your image has been successfully uploaded to </p>

          <p className="my-3 w-96 break-words">{uploadedImg}</p>
          <button
            className="cursor-pointer px-2 py-1 bg-purple-500 rounded-lg text-center active:bg-purple-400"
            onClick={() => copyTextToClipboard(uploadedImg)}
          >
            Copy image URL
          </button>
        </div>
      )}
      {error && (
        <div className="w-full md:px-10 lg:px-20">
          <div className="mx-12 mt-4 rounded-3xl bg-rose-50 p-8 text-rose-600 ">{error}</div>
        </div>
      )}
    </div>
  )
}

export default ImageDropZone
