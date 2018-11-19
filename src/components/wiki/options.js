import React from 'react'

const renderOptions = (path, permission, curr) => {
  const valid = [
    { key: 'view', name: 'View', path: '', requiresPermission: false },
    { key: 'edit', name: 'Edit', path: '/edit', requiresPermission: 'edit' },
    { key: 'history', name: 'History', path: '/history', requiresPermission: false }
  ]
  const active = valid.map(opt => opt.key).indexOf(curr) > -1 ? curr : valid[0]
  const options = []

  valid.forEach(option => {
    const isActive = option.key === active ? 'active' : null
    const hasPermission = option.requiresPermission
      ? permission[option.requiresPermission]
      : true
    if (hasPermission) {
      options.push(
        <li
          className={isActive}
          key={option.key}>
          <a href={`${path}${option.path}`} className='button secondary'>
            {option.name}
          </a>
        </li>
      )
    }
  })

  return (
    <nav className='wiki-options'>
      <ul>
        {options}
      </ul>
    </nav>
  )
}

export default renderOptions
