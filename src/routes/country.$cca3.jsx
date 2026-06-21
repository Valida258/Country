import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/country/$cca3')({
  component: CountryPage,
})

function CountryPage() {
  const { cca3 } = Route.useParams()

  // 1. Tək bir ölkə üçün sorğu (API massiv qaytardığı üçün data[0] götürülür)
  const { data: country, isLoading, isError } = useQuery({
    queryKey: ['country', cca3],
    queryFn: async () => {
      const res = await fetch(`https://restcountries.com/v3.1/alpha/${cca3}?fields=name,flags,population,region,capital,cca3,borders,languages,currencies,area`)
      if (!res.ok) throw new Error('Şəbəkə xətası baş verdi')
      
      const data = await res.json()
      // Əgər cavab massivdirsə, ilk elementi (ölkə obyektini) qaytarırıq
      return Array.isArray(data) ? data[0] : data
    },
  })

  // 2. Bütün ölkələrin siyahısı (Sərhəd kodlarını (məs: AZE) tam ada (Azerbaijan) çevirmək üçün)
  const { data: allCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca3')
      if (!res.ok) throw new Error('Şəbəkə xətası baş verdi')
      return res.json()
    },
  })

  // Yüklənmə və xəta vəziyyətlərinin idarə olunması
  if (isLoading) return <p style={{ padding: '24px' }}>Yüklənir...</p>
  if (isError || !country) return <p style={{ padding: '24px' }}>Xəta baş verdi və ya ölkə tapılmadı.</p>

  // Kodları ortaq adlara eşidən obyekt: { "AZE": "Azerbaijan" }
  const countryMap = Object.fromEntries((allCountries ?? []).map(c => [c.cca3, c.name?.common]))

  const languages = country.languages ? Object.values(country.languages).join(', ') : 'Yoxdur'
  const currencies = country.currencies ? Object.values(country.currencies).map(c => c.name).join(', ') : 'Yoxdur'

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '16px' }}>← Geri</Link>

      {country.flags?.svg && (
        <img 
          src={country.flags.svg} 
          alt={country.name?.common ?? 'Bayraq'} 
          style={{ width: '300px', borderRadius: '8px', display: 'block', marginBottom: '16px' }} 
        />
      )}

      <h1>{country.name?.common}</h1>
      <p><strong>Rəsmi ad:</strong> {country.name?.official ?? 'Yoxdur'}</p>
      <p><strong>Paytaxt:</strong> {country.capital?.[0] ?? 'Yoxdur'}</p>
      <p><strong>Region:</strong> {country.region ?? 'Yoxdur'}</p>
      <p><strong>Əhali:</strong> {country.population?.toLocaleString() ?? '0'}</p>
      <p><strong>Sahə:</strong> {country.area?.toLocaleString() ?? '0'} km²</p>
      <p><strong>Dillər:</strong> {languages}</p>
      <p><strong>Valyuta:</strong> {currencies}</p>

      {country.borders && country.borders.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3>Qonşu ölkələr:</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {country.borders.map(b => (
              <Link
                key={b}
                to="/country/$cca3"
                params={{ cca3: b }}
                style={{ 
                  padding: '6px 12px', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px', 
                  textDecoration: 'none', 
                  color: 'inherit' 
                }}
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