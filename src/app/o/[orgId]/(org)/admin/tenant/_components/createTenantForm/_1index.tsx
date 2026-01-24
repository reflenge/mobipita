"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import React from "react";
registerPlugin(FilePondPluginImagePreview);
const index = () => {
    return (
        <FilePond
            allowMultiple={true}
            storeAsFile={true}
            credits={false}
            labelIdle='<span class="filepond--label-action"> ファイル選択 </span> または ドラッグ&ドロップ'
        />
    );
};

export default index;
