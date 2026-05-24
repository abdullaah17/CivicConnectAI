/**
 * Returns true if itemHref should be considered "active" for the given pathname.
 * A more-specific sibling always wins — e.g. /requests/new beats /requests.
 */
export function isNavActive(
  itemHref: string,
  pathname: string,
  allItems: { href: string }[],
): boolean {
  if (pathname === itemHref) return true
  if (!pathname.startsWith(itemHref + '/')) return false
  // Don't activate if a more specific sibling also matches
  return !allItems.some(
    (other) =>
      other.href !== itemHref &&
      pathname.startsWith(other.href) &&
      other.href.length > itemHref.length,
  )
}
