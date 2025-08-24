'use server'
import { getCurrentUserId } from '@/app/apis/base/auth'
import {
  deleteAlbumImageRecord,
  getExistingAlbumImage,
  getUserThumbnail,
  insertAlbumImage,
  listAlbumImages,
  listFirstAlbumImage,
  removeFromAlbumBucket,
  updateUserThumbnail,
  uploadToAlbumBucket,
} from '@/app/apis/repository/profile/albumRepository'

export async function getAlbumGallery() {
  const userId = await getCurrentUserId()
  const [images, thumbnailUrl] = await Promise.all([
    listAlbumImages(userId),
    getUserThumbnail(userId),
  ])
  const formatted = Array(6).fill(null) as Array<{ id: string; url: string; isThumbnail: boolean } | null>
  let thumbnailIndex: number | null = null
  images.forEach((img) => {
    if (img.order_num >= 0 && img.order_num < 6) {
      const isThumb = img.image_url === thumbnailUrl
      formatted[img.order_num] = { id: img.id, url: img.image_url, isThumbnail: isThumb }
      if (isThumb) thumbnailIndex = img.order_num
    }
  })
  return { formatted, thumbnailIndex }
}

export async function uploadAlbumImage(formData: FormData) {
  const userId = await getCurrentUserId()
  const file = formData.get('file') as File | null
  const indexStr = formData.get('index') as string | null
  if (!file || indexStr === null) throw new Error('필수 정보(파일, 인덱스)가 누락되었습니다.')
  const index = parseInt(indexStr, 10)
  if (isNaN(index) || index < 0 || index > 5) throw new Error('유효하지 않은 인덱스입니다.')

  const existing = await getExistingAlbumImage(userId, index)
  const { publicUrl, filePath } = await uploadToAlbumBucket(userId, file, index)

  if (existing) {
    try {
      await deleteAlbumImageRecord(existing.id)
    } catch {}
    try {
      const oldPath = existing.image_url.split('albums/')[1]
      if (oldPath) await removeFromAlbumBucket(oldPath)
    } catch {}
  }

  const newImage = await insertAlbumImage(userId, publicUrl, index)
  return { ...newImage, isThumbnail: false }
}

export async function deleteAlbumImage(imageId: string) {
  const userId = await getCurrentUserId()
  // 읽기
  const images = await listAlbumImages(userId)
  const target = images.find((i) => i.id === imageId)
  if (!target) throw new Error('삭제할 이미지를 찾을 수 없습니다.')
  const currentThumb = await getUserThumbnail(userId)
  const wasThumb = target.image_url === currentThumb
  // 삭제
  await deleteAlbumImageRecord(target.id)
  try {
    const path = target.image_url.split('albums/')[1]
    if (path) await removeFromAlbumBucket(path)
  } catch {}
  // 썸네일 재설정
  let newThumbnailUrl: string | null = null
  if (wasThumb) {
    newThumbnailUrl = await listFirstAlbumImage(userId)
    await updateUserThumbnail(userId, newThumbnailUrl)
  }
  return { deletedImageId: imageId, newThumbnailUrl }
}

export async function setThumbnail(imageUrl: string) {
  const userId = await getCurrentUserId()
  if (!imageUrl) throw new Error('이미지 URL이 누락되었습니다.')
  await updateUserThumbnail(userId, imageUrl)
  return { newThumbnailUrl: imageUrl }
}


