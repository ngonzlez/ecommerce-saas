import Link from 'next/link'

type Props = {
  title: string
  linkUrl?: string | null
  linkText?: string | null
}

export default function AnnouncementBar({ title, linkUrl, linkText }: Props) {
  return (
    <div className="w-full bg-gray-900 text-white text-center text-xs py-2 px-4">
      {linkUrl ? (
        <Link href={linkUrl} className="hover:underline">
          {title}
          {linkText && <span className="ml-2 font-semibold">{linkText} →</span>}
        </Link>
      ) : (
        <span>{title}</span>
      )}
    </div>
  )
}
