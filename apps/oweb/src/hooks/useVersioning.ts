import { searchRead } from '@odooseek/odoo-client'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

export interface VersionInfo {
  id: number
  dateVersion: string
  contractDateStart?: string
  contractDateEnd?: string
  trialDateEnd?: string
  department?: [number, string] | false
  job?: [number, string] | false
  wage?: number
  contractType?: [number, string] | false
  employeeType?: string
  isCurrent: boolean
  isFuture: boolean
  isPast: boolean
  isInContract: boolean
  additionalNote?: string
}

interface UseVersioningResult {
  versions: VersionInfo[]
  currentVersionId: number | null
  selectedVersionId: number | null
  isLoading: boolean
  selectVersion: (versionId: number | null) => void
  goToCurrent: () => void
}

const VERSION_FIELDS = [
  'id',
  'date_version',
  'contract_date_start',
  'contract_date_end',
  'trial_date_end',
  'department_id',
  'job_id',
  'wage',
  'contract_type_id',
  'employee_type',
  'is_current',
  'is_future',
  'is_past',
  'is_in_contract',
  'additional_note',
]

export function useVersioning(employeeId: number | undefined): UseVersioningResult {
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null)

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['odoo', 'hr', 'versions', employeeId],
    queryFn: async () => {
      if (!employeeId) return []
      const records = await searchRead<Array<Record<string, unknown>>>(
        'hr.version',
        [['employee_id', '=', employeeId]],
        VERSION_FIELDS,
        0,
        100,
        'date_version DESC',
      )
      return records.map((rec): VersionInfo => ({
        id: rec.id as number,
        dateVersion: rec.date_version as string,
        contractDateStart: rec.contract_date_start as string | undefined,
        contractDateEnd: rec.contract_date_end as string | undefined,
        trialDateEnd: rec.trial_date_end as string | undefined,
        department: rec.department_id as [number, string] | false,
        job: rec.job_id as [number, string] | false,
        wage: rec.wage as number | undefined,
        contractType: rec.contract_type_id as [number, string] | false,
        employeeType: rec.employee_type as string | undefined,
        isCurrent: !!rec.is_current,
        isFuture: !!rec.is_future,
        isPast: !!rec.is_past,
        isInContract: !!rec.is_in_contract,
        additionalNote: rec.additional_note as string | undefined,
      }))
    },
    enabled: !!employeeId,
    staleTime: 5 * 60_000,
  })

  const currentVersionId =
    versions.find((v) => v.isCurrent)?.id ??
    versions[0]?.id ??
    null

  const selectVersion = useCallback((versionId: number | null) => {
    setSelectedVersionId(versionId)
  }, [])

  const goToCurrent = useCallback(() => {
    setSelectedVersionId(null)
  }, [])

  return {
    versions,
    currentVersionId,
    selectedVersionId,
    isLoading,
    selectVersion,
    goToCurrent,
  }
}
