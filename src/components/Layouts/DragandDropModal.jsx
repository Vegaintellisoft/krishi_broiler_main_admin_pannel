


  import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import React from 'react'
import { LuImport } from 'react-icons/lu';
import { MdContentPaste } from "react-icons/md";


const DragandDropModal = ({ files, setFiles }) => {

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxSize: 25 * 1024 * 1024,
  });

  return (
    <div
      {...getRootProps()}
      className="flex font-dm cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-gray-400"
    >
      <input {...getInputProps()} />
      <MdContentPaste color="orange" size={30} />
      <div className="text-center">
        <p className="mb-2 text-sm font-medium">Drop file or Browse</p>
        <p className="text-xs text-gray-500">Format: pdf, docx, doc & Max file size: 25 MB</p>
      </div>
      {files.length > 0 && (
        <div className="mt-4 w-full">
          {files.map((file) => (
            <div key={file.name} className="rounded bg-gray-50 p-2 text-sm">
              {file.name}
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 bg-orange-100 flex items-center gap-2 px-5 py-2 text-orange-500 rounded-3xl">
        <div className="rotate-180"><LuImport /></div>
        Browse
      </div>

    </div>
  )
}

export default DragandDropModal