const BASE_URL = 'https://api.clockify.me/api/v1'

function requireKey(apiKey) {
  const key = String(apiKey || '').trim()
  if (!key) throw new Error('API key missing — Settings me add karo.')
  return key
}

async function request(path, apiKey, params) {
  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  }
  const res = await fetch(url, {
    headers: { 'X-Api-Key': requireKey(apiKey) },
  })
  if (!res.ok) {
    let detail = ''
    try {
      const body = await res.json()
      detail = typeof body?.message === 'string' ? body.message : ''
    } catch {
      // non-JSON body
    }
    if (res.status === 401) throw new Error(detail || 'Unauthorized — API key galat hai.')
    if (res.status === 403) throw new Error(detail || 'Forbidden — is API key ko access nahi hai.')
    throw new Error(detail || `Clockify API error (HTTP ${res.status}).`)
  }
  return res.json()
}

export async function getMe(apiKey) {
  return request('/user', apiKey)
}

export async function getWorkspaces(apiKey) {
  return request('/workspaces', apiKey)
}

export async function autoDetect(apiKey) {
  const [user, workspaces] = await Promise.all([getMe(apiKey), getWorkspaces(apiKey)])
  const workspaceId = user?.activeWorkspace || workspaces?.[0]?.id || ''
  return { userId: user?.id || '', workspaceId }
}

export async function getTimeEntries(settings, startIso, endIso) {
  const apiKey = requireKey(settings.apiKey)
  const workspaceId = String(settings.workspaceId || '').trim()
  const userId = String(settings.userId || '').trim()
  if (!workspaceId || !userId) {
    throw new Error('Workspace ID / User ID missing — Settings me auto-detect ya manually add karo.')
  }

  // Clockify end-filter ke saath entries drop kar sakta hai — isi wajah se
  // 14 din peeche se fetch karke client-side filter karte hain (CLI wala logic).
  const fetchStart = new Date(new Date(startIso).getTime() - 14 * 86400000).toISOString()

  let allEntries = []
  let page = 1
  const pageSize = 500

  while (page <= 100) {
    const data = await request(
      `/workspaces/${workspaceId}/user/${userId}/time-entries`,
      apiKey,
      { start: fetchStart, page, 'page-size': pageSize, hydrated: true },
    )
    const batch = Array.isArray(data) ? data : []
    allEntries = allEntries.concat(batch)
    if (batch.length < pageSize) break
    page += 1
  }

  const startMs = new Date(startIso).getTime()
  const endMs = new Date(endIso).getTime()
  return allEntries.filter((e) => {
    const entryStart = new Date(e?.timeInterval?.start).getTime()
    return entryStart >= startMs && entryStart < endMs
  })
}
