import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  const { data: countries, isLoading, isError } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const res = await fetch('https://restcountries.com/v5/all?fields=name,flags,population,region,capital,cca3,borders', {
        headers: {
          'Authorization': 'Bearer BURAYA_API_KEY_YAZ'
        }
      })
      if (!res.ok) throw new Error('Şəbəkə xətası')
      const data = await res.json()
      return Array.isArray(data?.data) ? data.data : []
    },
  })

  if (isLoading) return <p style={{ padding: '24px' }}>Yüklənir...</p>
  if (isError || !countries) return <p style={{ padding: '24px' }}>Xəta baş verdi</p>

  const countryMap = Object.fromEntries(
    countries.map(c => [c.cca3, c.name?.common])
  )

  return (
    <div style={{ padding: '24px' }}>
      <h1>Ölkələr</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {countries.map((country) => (
          <Link
            key={country.cca3}
            to="/country/$cca3"
            params={{ cca3: country.cca3 }}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '12px',
              width: '200px',
              display: 'block'
            }}
          >
            {country.flags?.svg && (
              <img
                src={country.flags.svg}
                alt={country.name?.common}
                width="100%"
                height="120"
                style={{ objectFit: 'cover', borderRadius: '4px' }}
              />
            )}
            <h3>{country.name?.common}</h3>
            <p><strong>Region:</strong> {country.region}</p>
            <p><strong>Əhali:</strong> {country.population?.toLocaleString()}</p>
            <p><strong>Paytaxt:</strong> {country.capital?.[0] ?? 'Yoxdur'}</p>

            {country.borders && country.borders.length > 0 && (
              <p>
                <strong>Qonşular:</strong>{' '}
                {country.borders.map(b => countryMap[b] ?? b).join(', ')}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}