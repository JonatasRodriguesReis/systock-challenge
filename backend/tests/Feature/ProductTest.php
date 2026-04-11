<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Product;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        // Criamos um admin global para os testes de produtos
        $this->admin = User::factory()->create();
    }

    public function test_can_list_paginated_products_with_meta(): void
    {
        Product::factory(15)->create();

        $response = $this->actingAs($this->admin)
                         ->getJson('/api/produtos?per_page=10');

        $response->assertStatus(200)
                 ->assertJsonCount(10, 'data')
                 ->assertJsonStructure([
                     'data',
                     'meta' => ['current_page', 'last_page', 'total']
                 ]);
    }

    public function test_can_filter_products_by_name_and_pagination(): void
    {
        // Criar produtos específicos para busca
        Product::factory()->create(['nome' => 'Monitor Gamer']);
        Product::factory()->create(['nome' => 'Teclado Mecânico']);
        Product::factory(10)->create();

        // 1. Test Search (usando LIKE compatível com SQLite/Postgres)
        $response = $this->actingAs($this->admin)
            ->getJson('/api/produtos?search=Monitor');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 1);

        // 2. Test Sorting (Preço descendente)
        Product::factory()->create(['nome' => 'Produto Caro', 'preco' => 9999.99]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/produtos?sort_by=preco&sort_order=desc');

        $this->assertEquals('Produto Caro', $response->json('data.0.nome'));
    }

    public function test_can_create_a_new_product_via_post(): void
    {
        $payload = [
            'nome' => 'Mouse Wireless',
            'descricao' => 'Mouse ergonomico 2.4ghz',
            'preco' => 150.50,
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/produtos', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('produtos', ['nome' => 'Mouse Wireless']);
    }

    public function test_can_update_product(): void
    {
        $product = Product::factory()->create(['nome' => 'Cadeira Simples', 'usuario_id' => $this->admin->id]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/produtos/{$product->id}", [
                'nome' => 'Cadeira Gamer',
                'preco' => 1200.00,
                'descricao' => 'Cadeira gamer',
            ]);
        $response->dump(   );

        $response->assertStatus(200);
        $this->assertDatabaseHas('produtos', [
            'id' => $product->id,
            'nome' => 'Cadeira Gamer',
            'preco' => 1200.00,
            'descricao' => 'Cadeira gamer',
        ]);
    }

    public function test_can_delete_product(): void
    {
        $product = Product::factory()->create(['usuario_id' => $this->admin->id]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/produtos/{$product->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('produtos', ['id' => $product->id]);
    }

    public function test_returns_404_for_invalid_product(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson("/api/produtos/999999");

        $response->assertStatus(404);
    }
}
