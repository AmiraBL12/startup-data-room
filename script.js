/**
 * Moran AI Data Room
 * Interactive JavaScript for folder expansion and UI interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeFolderCards();
    animateCardEntrance();
});

/**
 * Staggered card entrance animation
 */
function animateCardEntrance() {
    const cards = document.querySelectorAll('.folder-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('visible');
        }, index * 60);
    });
}

/**
 * Initialize folder card click handlers with inline drawer behavior
 */
function initializeFolderCards() {
    const folderCards = document.querySelectorAll('.folder-card');

    folderCards.forEach(card => {
        card.addEventListener('click', function() {
            handleFolderClick(this);
        });
    });
}

/**
 * Handle folder card click - show drawer inline below the folder's row
 */
function handleFolderClick(clickedCard) {
    const folderName = clickedCard.getAttribute('data-folder');
    const contentsId = `${folderName}-contents`;
    const contentsElement = document.getElementById(contentsId);
    const folderGrid = clickedCard.closest('.folder-grid');

    if (!contentsElement || !folderGrid) return;

    const isExpanded = clickedCard.classList.contains('expanded');

    // Close any other open drawers in this grid first
    closeOtherDrawers(folderGrid, clickedCard);

    if (isExpanded) {
        closeDrawer(clickedCard, contentsElement);
    } else {
        openDrawer(clickedCard, contentsElement, folderGrid);
    }
}

/**
 * Close all other open drawers in the grid
 */
function closeOtherDrawers(folderGrid, exceptCard) {
    const siblingCards = folderGrid.querySelectorAll('.folder-card.expanded');

    siblingCards.forEach(card => {
        if (card !== exceptCard) {
            const folderName = card.getAttribute('data-folder');
            const contentsElement = document.getElementById(`${folderName}-contents`);
            if (contentsElement) {
                closeDrawer(card, contentsElement);
            }
        }
    });
}

/**
 * Close a drawer
 */
function closeDrawer(card, contentsElement) {
    card.classList.remove('expanded');
    contentsElement.classList.remove('visible', 'inline-drawer');
}

/**
 * Open a drawer inline below the folder's row
 */
function openDrawer(card, contentsElement, folderGrid) {
    const lastCardInRow = getLastCardInSameRow(card, folderGrid);

    contentsElement.classList.add('inline-drawer');

    // Calculate arrow position (center of the clicked card)
    const cardRect = card.getBoundingClientRect();
    const gridRect = folderGrid.getBoundingClientRect();
    const arrowPosition = cardRect.left - gridRect.left + (cardRect.width / 2) - 8;
    contentsElement.style.setProperty('--drawer-arrow-position', `${arrowPosition}px`);

    // Insert the contents element right after the last card in the row
    lastCardInRow.insertAdjacentElement('afterend', contentsElement);

    // Trigger reflow and show
    contentsElement.offsetHeight; // Force reflow
    contentsElement.classList.add('visible');
    card.classList.add('expanded');

    // Smooth scroll into view
    setTimeout(() => {
        contentsElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }, 100);
}

/**
 * Find the last folder card in the same visual row as the given card
 */
function getLastCardInSameRow(card, folderGrid) {
    const allCards = Array.from(folderGrid.querySelectorAll('.folder-card'));
    const clickedCardTop = card.getBoundingClientRect().top;

    const cardsInSameRow = allCards.filter(c => {
        const top = c.getBoundingClientRect().top;
        return Math.abs(top - clickedCardTop) < 2;
    });

    return cardsInSameRow[cardsInSameRow.length - 1];
}

/**
 * Handle window resize - recalculate drawer positions if needed
 */
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const expandedCards = document.querySelectorAll('.folder-card.expanded');
        expandedCards.forEach(card => {
            const folderName = card.getAttribute('data-folder');
            const contentsElement = document.getElementById(`${folderName}-contents`);
            const folderGrid = card.closest('.folder-grid');

            if (contentsElement && contentsElement.classList.contains('visible')) {
                const lastCardInRow = getLastCardInSameRow(card, folderGrid);

                if (contentsElement.previousElementSibling !== lastCardInRow) {
                    lastCardInRow.insertAdjacentElement('afterend', contentsElement);
                }

                const cardRect = card.getBoundingClientRect();
                const gridRect = folderGrid.getBoundingClientRect();
                const arrowPosition = cardRect.left - gridRect.left + (cardRect.width / 2) - 8;
                contentsElement.style.setProperty('--drawer-arrow-position', `${arrowPosition}px`);
            }
        });
    }, 150);
});

/**
 * Show tooltip notification — glass style
 */
function showTooltip(_element, message) {
    const existingTooltip = document.querySelector('.tooltip-notification');
    if (existingTooltip) {
        existingTooltip.remove();
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip-notification';
    tooltip.textContent = message;

    const tooltipStyle = document.createElement('style');
    tooltipStyle.textContent = `
        .tooltip-notification {
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.75);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(0, 0, 0, 0.08);
            color: #1a1a2e;
            padding: 0.75rem 1.5rem;
            border-radius: 12px;
            font-size: 0.9rem;
            font-family: 'Inter', sans-serif;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            z-index: 1000;
            animation: tooltipFade 2s ease forwards;
        }

        @keyframes tooltipFade {
            0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
            15% { opacity: 1; transform: translateX(-50%) translateY(0); }
            85% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
    `;

    document.head.appendChild(tooltipStyle);
    document.body.appendChild(tooltip);

    setTimeout(() => {
        tooltip.remove();
    }, 2000);
}

/**
 * File item click handler — opens document preview modal
 */
document.addEventListener('click', function(e) {
    if (e.target.closest('.file-item')) {
        e.stopPropagation();
        const fileItem = e.target.closest('.file-item');
        const fileName = fileItem.getAttribute('data-filename') || fileItem.textContent.trim();

        fileItem.style.background = 'rgba(59, 130, 246, 0.12)';
        setTimeout(() => {
            fileItem.style.background = '';
        }, 200);

        openDocumentModal(fileName);
    }
});

/**
 * Open the document preview modal with content for the given filename
 */
function openDocumentModal(fileName) {
    if (typeof FILE_CONTENTS === 'undefined' || !FILE_CONTENTS[fileName]) {
        showTooltip(null, 'Content not available: ' + fileName);
        return;
    }

    var fileData = FILE_CONTENTS[fileName];
    var modal = document.getElementById('documentModal');
    var modalTitle = document.getElementById('modalTitle');
    var modalSubtitle = document.getElementById('modalSubtitle');
    var modalDate = document.getElementById('modalDate');
    var modalBody = document.getElementById('modalBody');
    var modalFileIcon = document.getElementById('modalFileIcon');

    modalTitle.textContent = fileData.title;
    modalSubtitle.textContent = fileData.subtitle;
    modalDate.textContent = fileData.date;

    modalFileIcon.className = 'fas modal-file-icon';
    if (fileData.type === 'pdf') {
        modalFileIcon.classList.add('fa-file-pdf', 'pdf');
    } else {
        modalFileIcon.classList.add('fa-file-excel', 'xlsx');
    }

    modalBody.innerHTML = fileData.content;

    modal.classList.add('active');
    document.body.classList.add('modal-open');
    modalBody.scrollTop = 0;
}

/**
 * Close the document preview modal
 */
function closeDocumentModal() {
    var modal = document.getElementById('documentModal');
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
}

// Close button
document.getElementById('modalCloseBtn').addEventListener('click', function(e) {
    e.stopPropagation();
    closeDocumentModal();
});

// Click outside modal (on overlay) to close
document.getElementById('documentModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeDocumentModal();
    }
});

/**
 * Add keyboard navigation support
 */
document.addEventListener('keydown', function(e) {
    // Escape key closes modal
    if (e.key === 'Escape') {
        var modal = document.getElementById('documentModal');
        if (modal && modal.classList.contains('active')) {
            closeDocumentModal();
            return;
        }
    }

    const focusedCard = document.activeElement;

    if (focusedCard && focusedCard.classList.contains('folder-card')) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            focusedCard.click();
        }
    }
});

// Make folder cards focusable
document.querySelectorAll('.folder-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-expanded', 'false');
});

// Update aria-expanded when folders are toggled
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
            const card = mutation.target;
            if (card.classList.contains('folder-card')) {
                card.setAttribute('aria-expanded', card.classList.contains('expanded'));
            }
        }
    });
});

document.querySelectorAll('.folder-card').forEach(card => {
    observer.observe(card, { attributes: true });
});
