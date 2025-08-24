import 'server-only'

import { wrapService } from '@/app/apis/base'
import { getCurrentUserId } from '@/app/apis/base/auth'
import { uploadAvatar, getAvatarPublicUrl } from '@/app/apis/repository/storage/storageRepository'

export async function uploadMyAvatar(file: File) {
  return wrapService('storage.uploadMyAvatar', async () => {
    const userId = await getCurrentUserId()
    const fileExt = file.name.split('.').pop() || 'dat'
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${userId}/${fileName}`
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)
    await uploadAvatar(filePath, fileBuffer, file.type)
    const url = await getAvatarPublicUrl(filePath)
    return { success: true, data: { url } }
  })
}


