/**
 * @param {import('react').HTMLAttributes<HTMLDivElement>} props
 */
export function Table({ className = '', children, ...props }) {
  return (
    <div className={`overflow-x-auto rounded-lg border border-secondary/20 bg-surface ${className}`} {...props}>
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">{children}</table>
    </div>
  )
}

/**
 * @param {import('react').HTMLAttributes<HTMLTableSectionElement>} props
 */
export function TableHead({ className = '', children, ...props }) {
  return (
    <thead className={`border-b border-secondary/20 bg-neutral ${className}`} {...props}>
      {children}
    </thead>
  )
}

/**
 * @param {import('react').HTMLAttributes<HTMLTableSectionElement>} props
 */
export function TableBody({ className = '', children, ...props }) {
  return <tbody className={`divide-y divide-secondary/10 ${className}`} {...props}>{children}</tbody>
}

/**
 * @param {import('react').ThHTMLAttributes<HTMLTableCellElement>} props
 */
export function TableHeaderCell({ className = '', children, ...props }) {
  return (
    <th
      className={`px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wide text-secondary ${className}`}
      {...props}
    >
      {children}
    </th>
  )
}

/**
 * @param {import('react').TdHTMLAttributes<HTMLTableCellElement>} props
 */
export function TableCell({ className = '', children, ...props }) {
  return (
    <td className={`px-4 py-3 text-primary ${className}`} {...props}>
      {children}
    </td>
  )
}
