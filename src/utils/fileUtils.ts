import JSzip from 'jszip';
import { FileItem } from '../types';
import { saveAs } from 'file-saver';


export const downloadFiles = async (files: FileItem[]) => {
    const zip = new JSzip();
    await Promise.all(
        files.map(async (fileObj) => {
            try {
                if (!fileObj.metadata?.url) { return null }
                const response = await fetch(fileObj.metadata?.url || '');
                const blob = await response.blob();
                zip.file(fileObj.name, blob)
            } catch (err) {
                console.log('=== Error occured while downloading', fileObj.name, err)
            }
        })
    )
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, `${files[0].metadata?.sourceSystem}-${files[0].metadata?.clientId}.zip`)
}