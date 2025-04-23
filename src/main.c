extern int js_fprintf(void *stream, const char *format, ...);

#define DS_NO_STDLIB
#define DS_DA_INIT_CAPACITY 16
#define DS_LIST_ALLOCATOR_IMPLEMENTATION
#define DS_DA_IMPLEMENTATION
#define DS_NO_TERMINAL_COLORS
#define fprintf js_fprintf
#include "ds.h"

extern int js_width();
extern int js_height();
extern int js_random(int a, int b);

extern void js_clear_canvas();
extern void js_draw_rect(int x, int y, int w, int h, int color);

typedef struct rect {
    int x, y, w, h;
} rect_t;

void rect_random(int width, int height, rect_t *rect) {
    int w = js_random(width / 8, width / 4);
    int h = js_random(height / 8, height / 4);
    int x = js_random(0, width - w);
    int y = js_random(0, height - h);

    rect->w = w;
    rect->h = h;
    rect->x = x;
    rect->y = y;
}

typedef struct piece {
    rect_t rect;
    int color;
    float vx, vy;
} piece_t;

void piece_random(int width, int height, piece_t *piece) {
    rect_random(width, height, &piece->rect);
    piece->color = js_random(0, 0xFFFFFF);
    piece->vx = js_random(-100, 100) / 100.0f;
    piece->vy = js_random(-100, 100) / 100.0f;
}

DS_ALLOCATOR allocator = {0};
ds_dynamic_array array = {0};

void init(void *memory, unsigned long size) {
    DS_INIT_ALLOCATOR(&allocator, memory, size);
    ds_dynamic_array_init_allocator(&array, sizeof(piece_t), &allocator);

    for (unsigned int i = 0; i < 10; i++) {
        piece_t piece = {0};
        piece_random(js_width(), js_height(), &piece);
        ds_dynamic_array_append(&array, &piece);
    }
}

void tick(float deltaTime) {
    js_clear_canvas();
    for (unsigned int i = 0; i < array.count; i++) {
        piece_t *piece = NULL;
        ds_dynamic_array_get_ref(&array, i, (void **)&piece);
        js_draw_rect(piece->rect.x, piece->rect.y, piece->rect.w, piece->rect.h,
                     piece->color);

        if (piece->rect.x < 0 || piece->rect.x + piece->rect.w > js_width()) {
            piece->vx = -piece->vx;
        }

        if (piece->rect.y < 0 || piece->rect.y + piece->rect.h > js_height()) {
            piece->vy = -piece->vy;
        }

        piece->rect.x += piece->vx * deltaTime;
        piece->rect.y += piece->vy * deltaTime;
    }
}
