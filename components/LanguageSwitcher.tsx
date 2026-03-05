"use client"

export default function LanguageSwitcher() {

  const changeLanguage = (lang: string) => {
    localStorage.setItem("lang", lang)
    window.location.reload()
  }

  return (
    <select
      className="text-black px-2 py-1 rounded"
      onChange={(e) => changeLanguage(e.target.value)}
    >
      <option value="en">English</option>
      <option value="hi">Hindi</option>
      <option value="te">Telugu</option>
      <option value="ta">Tamil</option>
    </select>
  )
}