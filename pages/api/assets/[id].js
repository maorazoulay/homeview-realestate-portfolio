import dbConnect from '@/db/dbConnect'
import Asset from '@/db/Asset'

export default async function handler(req, res) {
  const {query: { id }, method} = req
  console.log(req);

  await dbConnect()

  switch (method) {
    case 'GET':
      try {
        const asset = await Asset.findById(id)
        if (!asset) {
          return res.status(400).json({ success: false })
        }
        res.status(200).json({ success: true, data: asset })
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break

    case 'PUT':
      try {
        const asset = await Asset.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        })
        if (!asset) {
          return res.status(400).json({ success: false })
        }
        res.status(200).json({ success: true, data: asset })
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break

    case 'DELETE':
      try {
        const deletedAsset = await Asset.deleteOne({ _id: id })
        if (!deletedAsset) {
          return res.status(400).json({ success: false })
        }
        res.status(200).json({ success: true, data: {deletedAsset} })
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break

    default:
      res.status(400).json({ success: false })
      break
  }
}