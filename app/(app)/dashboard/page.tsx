import { ChartAreaInteractive } from "@/app/(app)/chart-area-interactive"
import { DataTable } from "@/app/(app)/data-table"
import { SectionCards } from "@/app/(app)/section-cards"

import data from "@/app/(app)/data.json"

export default function Page() {
  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </>
  )
}
