import { site } from "@/lib/site"

/** Floating WhatsApp contact button — bottom-right, brand green, pulsing halo. */
export function WhatsappFab() {
  if (!site.whatsappUrl) return null

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-[ping_1.8s_cubic-bezier(0,0,0.2,1)_infinite]"
      />
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-[ping_1.8s_cubic-bezier(0,0,0.2,1)_infinite] [animation-delay:0.9s]"
      />
      <a
        href={site.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="relative grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/25 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
      >
        <svg viewBox="0 0 32 32" className="size-7 fill-current" role="img" aria-hidden>
          <path d="M16.003 3C9.383 3 4 8.383 4 15.003c0 2.117.553 4.184 1.603 6.006L4 29l8.17-1.57a12.02 12.02 0 0 0 3.833.626h.001C22.62 28.056 28 22.673 28 16.053 28 9.433 22.62 3 16.003 3zm0 21.9h-.001a9.9 9.9 0 0 1-3.75-.734l-.269-.107-4.85.932.933-4.73-.175-.28a9.9 9.9 0 1 1 8.112 4.797zm5.44-7.41c-.298-.15-1.76-.868-2.033-.967-.273-.1-.472-.15-.67.15-.199.298-.769.967-.943 1.166-.174.199-.348.223-.646.075-.298-.15-1.257-.463-2.395-1.476-.885-.79-1.482-1.766-1.656-2.064-.174-.298-.019-.459.13-.607.134-.133.298-.348.447-.522.15-.174.199-.298.298-.497.1-.199.05-.373-.025-.522-.075-.15-.67-1.612-.918-2.208-.242-.58-.487-.502-.67-.512l-.571-.01c-.198 0-.52.075-.793.373-.273.298-1.04 1.016-1.04 2.478s1.065 2.874 1.213 3.073c.15.199 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.76-.719 2.008-1.413.248-.694.248-1.29.174-1.413-.075-.124-.273-.199-.571-.348z" />
        </svg>
      </a>
    </div>
  )
}
