import { put, del, list } from "@vercel/blob"

export async function uploadPropertyImage(file: File, propertyId: string): Promise<string> {
  const timestamp = Date.now()
  const filename = `properties/${propertyId}/${timestamp}-${file.name}`

  const blob = await put(filename, file, {
    access: "public",
  })

  return blob.url
}

export async function deletePropertyImage(blobUrl: string): Promise<void> {
  const url = new URL(blobUrl)
  const pathname = url.pathname.replace("/public/", "")
  await del(blobUrl)
}

export async function listPropertyImages(propertyId: string) {
  const { blobs } = await list({
    prefix: `properties/${propertyId}/`,
  })
  return blobs
}
