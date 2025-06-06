import { Component } from "@theme/component";
import {
    ThemeEvents,
    VariantUpdateEvent,
    ZoomMediaSelectedEvent,
} from "@theme/events";

/**
 * A custom element that renders a media gallery.
 *
 * @typedef {object} Refs
 * @property {import('./zoom-dialog').ZoomDialog} [zoomDialogComponent] - The zoom dialog component.
 * @property {import('./slideshow').Slideshow} [slideshow] - The slideshow component.
 * @property {HTMLElement[]} [media] - The media elements.
 *
 * @extends Component<Refs>
 */
export class MediaGallery extends Component {
    #controller = new AbortController();

    connectedCallback() {
        super.connectedCallback();

        const { signal } = this.#controller;
        const target = this.closest(".shopify-section, dialog");

        target?.addEventListener(
            ThemeEvents.variantUpdate,
            this.#handleVariantUpdate,
            { signal }
        );
        target?.addEventListener(
            "option1-selected",
            this.#handleOptionSelected,
            { signal }
        );
        this.refs.zoomDialogComponent?.addEventListener(
            ThemeEvents.zoomMediaSelected,
            this.#handleZoomMediaSelected,
            {
                signal,
            }
        );
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.#controller.abort();
    }

    /**
     * Handles a variant update event by replacing the current media gallery with a new one.
     *
     * @param {VariantUpdateEvent} event - The variant update event.
     */
    #handleVariantUpdate = (event) => {
        const source = event.detail.data.html;

        if (!source) return;
        const newMediaGallery = source.querySelector("media-gallery");

        if (!newMediaGallery) return;

        this.replaceWith(newMediaGallery);
    };

    /**
     * Handles the 'zoom-media:selected' event.
     * @param {ZoomMediaSelectedEvent} event - The zoom-media:selected event.
     */
    #handleZoomMediaSelected = async (event) => {
        this.refs.slideshow?.select(event.detail.index, undefined, {
            animate: false,
        });
    };

    /**
     * Handle option selection and update gallery
     * @param {CustomEvent} event
     */
    #handleOptionSelected = (event) => {
        const { galleryImages } = event.detail;
        if (galleryImages && galleryImages.length > 0) {
            this.#updateGalleryImages(galleryImages);
        }
    };

    /**
     * Update gallery images
     * @param {string[]} images
     */

    #updateGalleryImages = (images) => {
        if (!this.refs.slideshow) return;

        // Get both variant images and product images
        const variantImages = images || [];
        const container =
            this.refs.slideshow.querySelector(".slideshow__slides");
        if (!container) return;

        // Clear existing slides
        container.innerHTML = "";

        // Create slides for variant images
        const slideshowHtml = variantImages
            .map(
                (imageUrl) => `
                  <div class="slideshow__slide">
                      <div class="media media--square">
                          <img
                              src="${imageUrl}"
                              alt=""
                              loading="lazy"
                              class="media__image"
                          >
                      </div>
                  </div>
              `
            )
            .join("");

        // Insert the new slides
        container.innerHTML = slideshowHtml;

        // Reset to first slide
        this.refs.slideshow.select(0, undefined, { animate: false });
    };

    /**
     * Zooms the media gallery.
     *
     * @param {number} index - The index of the media to zoom.
     * @param {PointerEvent} event - The pointer event.
     */
    zoom(index, event) {
        this.refs.zoomDialogComponent?.open(index, event);
    }

    get slideshow() {
        return this.refs.slideshow;
    }

    get media() {
        return this.refs.media;
    }

    get presentation() {
        return this.dataset.presentation;
    }
}

if (!customElements.get("media-gallery")) {
    customElements.define("media-gallery", MediaGallery);
}
