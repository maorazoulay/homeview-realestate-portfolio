import { useEffect, useState } from "react"
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/DashboardLayout'
import SimpleImageSlider from "react-simple-image-slider"
import { priceFormatter, dateFormatter, getClassesForSubmitButton, handleDisablingButton } from '@/utils/formUtils'
import ConfirmationDialog from '@/components/ConfirmationDialog'
import Spinner from "@/components/Spinner"
import { findAssetById } from "@/db/dbOperations"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import EditAssetForm from "@/components/EditAssetForm"
export default function Asset({ asset }) {
  const [tempAsset, setTempAsset] = useState(asset)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disabledSubmit, setDisabledSubmit] = useState(false)
  const router = useRouter()
  const assetId = asset._id

  console.log('tempAsset', tempAsset);

  useEffect(() => {
    // enable submit button when all values are provided
    handleDisablingButton(tempAsset, disabledSubmit, setDisabledSubmit)
  }, [tempAsset, disabledSubmit])

  const images = asset.images.map(image => {
    return { url: image }
  })

  function makeRequest(method, requestAction, successAction) {
    fetch(`/api/assets/${assetId}`, { method: method })
      .then(response => response.json())
      .then(responseData => {
        if (responseData.success) {
          successAction(router)
        } else {
          console.log(`Failed to ${requestAction} asset from server`);
        }
      }).catch((error) => {
        console.error(`Error while trying to ${requestAction}: ${error.message}`);
      })
  }

  function editAsset(event) {
    event.preventDefault()
    setLoading(true)
    makeRequest('PUT', 'update', (router) => router.reload())
    setShowEditModal(false)
    setLoading(false)
  }

  function deleteAsset() {
    setLoading(true)
    console.log('deleting', assetId);
    fetch(`/api/assets/${assetId}`, { method: 'DELETE' })
      .then(response => response.json())
      .then(responseData => {
        if (responseData.success) {
          router.push('/dashboard/assets')
        } else {
          console.log('Failed to delete asset');
        }
      }).catch((error) => {
        console.error(`Error while trying to delete: ${error.message}`);
      })
  }

  function handleChange({ target }) {
    const { name, value } = target
    setTempAsset((prevAssetData) => ({ ...prevAssetData, [name]: value }))
  }

  return (
    <div className='h-full pt-2'>
      <h1 className='text-center text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-bold text-indigo-700 overline'>{asset.title}</h1>
      <div className='h-95% lg:h-9/10 flex flex-col items-center lg:flex-row justify-center px-3 pt-2 lg:p-5 gap-4 sm:gap-2 lg:mt-4'>
        <div className='w-full h-2/3 lg:h-full'>
          <SimpleImageSlider
            width={'100%'}
            height={'100%'}
            images={images}
            showBullets={true}
            showNavs={true}
            style={{ perspective: '1px', borderRadius: '0.75rem' }}
          />
        </div>
        <div className='flex flex-col w-full h-full justify-between bg-indigo-50 rounded-xl p-3'>
          <ul className='text-1xl sm:text-2xl'>
            <li className='border-b-2 py-3 border-indigo-500'> <span className='font-bold underline'>Address:</span> {asset.address}</li>
            <li className='border-b-2 py-3 border-indigo-500'><span className='font-bold underline'>Property Type:</span> {asset.propertyType}</li>
            <li className='border-b-2 py-3 border-indigo-500'><span className='font-bold underline'>Purchase Price:</span> {priceFormatter(asset.purchasePrice)}</li>
            <li className='border-b-2 py-3 border-indigo-500'><span className='font-bold underline'>Purchase Date:</span> {dateFormatter(asset.purchaseDate)}</li>
            <li className='border-b-2 py-3 border-indigo-500'><span className='font-bold underline'>Market Value:</span> {priceFormatter(asset.marketValue)}</li>
          </ul>
          <div className='flex justify-center border-t-2 border-indigo-600 p-2 gap-8'>
            <button
              className="hvr-hang bg-indigo-700 text-white active:bg-indigo-900 font-bold text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              type="button"
              onClick={() => setShowEditModal(true)}>Edit Asset
            </button>
            <button
              className="hvr-hang bg-red-600 text-white active:bg-red-800 font-bold text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              type="button"
              onClick={() => setShowDeleteModal(true)}>Delete Asset
            </button>
            {showEditModal && <EditAssetForm
              title={'Edit Asset'}
              formData={tempAsset}
              handleChange={handleChange}
              handleSubmit={editAsset}
              disabledSubmit={disabledSubmit}
              onClose={() => setShowEditModal(false)} />}
            {showDeleteModal && !loading && <ConfirmationDialog
              message={'Are you sure you want to delete this asset?'}
              actionButtonText={'Delete'}
              actionFunction={deleteAsset}
              closeFunction={() => setShowDeleteModal(false)} />
            }
            {loading && <Spinner />}
          </div>
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps({ req, res, query }) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return { redirect: { destination: "/auth/signin" } };
  }

  const assetId = query.id
  const asset = await findAssetById(assetId)

  return {
    props: {
      asset: asset,
      session: session
    }
  }
}

Asset.getLayout = function getLayout(page) {
  return (
    <DashboardLayout>{page}</DashboardLayout>
  )
}