import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/country/$cca3')({
  component: CountryPage,
})

function CountryPage() {
  const { cca3 } = Route.useParams()

  // 1. Tək bir ölkə üçün sorğu
  const { data: country, isLoading, isError } = useQuery({
    queryKey: ['country', cca3],
    queryFn: async () => {
      const res = await fetch(`https://restcountries.com/v5/alpha/${cca3}?fields=name,flags,population,region,capital,cca3,borders,languages,currencies,area`)
      if (!res.ok) throw new Error('Şəbəkə xətası')
      const data = await res.json()
      // API bəzən massiv qaytarır, bəzən obyekt
      return Array.isArray(data) ? data[0] : data
    },
  })

  // 2. Bütün ölkələrin siyahısı
  const { data: allCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const res = await fetch('https://restcountries.com/v5/all?fields=name,cca3')
      return res.json()
    },
    staleTime: 1000 * 60 * 60, // Məlumatları 1 saatlıq keşləyirik ki, hər dəfə serverə getməsin
  })

  if (isLoading) return <p style={{ padding: '24px' }}>Yüklənir...</p>
  if (isError || !country) return <p style={{ padding: '24px' }}>Ölkə tapılmadı.</p>

  // Təhlükəsiz obyekt yaradılması
  const countryMap = (allCountries ?? []).reduce((acc, curr) => {
    acc[curr.cca3] = curr.name?.common
    return acc
  }, {})

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '16px' }}>← Geri</Link>

      {country.flags?.svg && (
        <img 
          src={country.flags.svg} 
          alt={country.name?.common} 
          style={{ width: '300px', borderRadius: '8px', marginBottom: '16px' }} 
        />
      )}

      <h1>{country.name?.common}</h1>
      <p><strong>Rəsmi ad:</strong> {country.name?.official}</p>
      <p><strong>Paytaxt:</strong> {country.capital?.join(', ') ?? 'Yoxdur'}</p>
      <p><strong>Region:</strong> {country.region}</p>
      <p><strong>Əhali:</strong> {country.population?.toLocaleString()}</p>
      <p><strong>Dillər:</strong> {country.languages ? Object.values(country.languages).join(', ') : 'Yoxdur'}</p>
      
      {country.borders && (
        <div style={{ marginTop: '24px' }}>
          <h3>Qonşu ölkələr:</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {country.borders.map(b => (
              <Link
                key={b}
                to="/country/$cca3"
                params={{ cca3: b }}
                style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                {countryMap[b] ?? b}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}