function rect(element) {
  return element?.getBoundingClientRect()
}

function overflowX(element) {
  return element ? Math.max(0, element.scrollWidth - element.clientWidth) : null
}

export function auditBrowserPage() {
  const grid = document.querySelector('.browser-results__grid')
  const cards = [...document.querySelectorAll('.result-card')]
  const gridStyle = grid ? getComputedStyle(grid) : null
  const columns = gridStyle?.gridTemplateColumns.split(/\s+/).filter(Boolean) ?? []

  return {
    url: window.location.href,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    pageOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    columns: columns.length,
    gridColumnSizes: columns,
    rowGap: gridStyle?.rowGap,
    columnGap: gridStyle?.columnGap,
    cardCount: cards.length,
    activePage: document.querySelector('[aria-current="page"]')?.textContent.trim() ?? null,
    previousDisabled: document.querySelector('[aria-label="Previous page"]')?.disabled ?? null,
    nextDisabled: document.querySelector('[aria-label="Next page"]')?.disabled ?? null,
    detailsLinks: document.querySelectorAll('.result-card__details').length,
    cards: cards.map((card) => {
      const name = card.querySelector('h3')
      const details = card.querySelector('.result-card__details')
      const smiles = card.querySelector('.result-card__row--smiles dd')
      const structure = card.querySelector('.result-card__structure')
      const image = structure?.querySelector('img')
      const cardRect = rect(card)
      const nameRect = rect(name)
      const detailsRect = rect(details)
      const structureRect = rect(structure)
      const smilesStyle = smiles ? getComputedStyle(smiles) : null

      return {
        id: card.querySelector('.result-card__id')?.textContent.trim(),
        cardHeight: cardRect?.height,
        cardOverflowX: overflowX(card),
        nameDetailsOverlap: Boolean(nameRect && detailsRect && nameRect.right > detailsRect.left),
        detailsVisible: Boolean(detailsRect && detailsRect.width > 0 && detailsRect.height > 0),
        detailsHref: details?.getAttribute('href') ?? null,
        smilesText: smiles?.textContent.trim() ?? '',
        smilesTitle: smiles?.getAttribute('title') ?? '',
        smilesOverflowX: overflowX(smiles),
        smilesHeightOverflow: smiles ? Math.max(0, smiles.scrollHeight - smiles.clientHeight) : null,
        smilesWhiteSpace: smilesStyle?.whiteSpace,
        smilesWordBreak: smilesStyle?.wordBreak,
        smilesOverflowWrap: smilesStyle?.overflowWrap,
        smilesTextOverflow: smilesStyle?.textOverflow,
        structureInsideCard: Boolean(cardRect && structureRect && structureRect.right <= cardRect.right + 1),
        imageLoaded: Boolean(image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0),
        imageNaturalSize: image ? `${image.naturalWidth}x${image.naturalHeight}` : null,
        imageObjectFit: image ? getComputedStyle(image).objectFit : null,
      }
    }),
  }
}

export function resourceAudit() {
  const resources = performance.getEntriesByType('resource')
  return {
    count: resources.length,
    failed: resources
      .filter((entry) => 'responseStatus' in entry && entry.responseStatus >= 400)
      .map((entry) => ({ name: entry.name, status: entry.responseStatus })),
    images: [...document.images].map((image) => ({
      src: image.currentSrc || image.src,
      loaded: image.complete && image.naturalWidth > 0,
    })),
  }
}
