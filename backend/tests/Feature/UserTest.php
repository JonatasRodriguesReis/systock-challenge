<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_paginated_users_with_meta_object(): void
    {
        User::factory(15)->create();
        $admin = User::factory()->create();

        $response = $this->actingAs($admin)
                         ->getJson('/api/usuarios?per_page=10');

        $response->assertStatus(200)
                 ->assertJsonCount(10, 'data') // Verifica se vieram 10 registros
                 ->assertJsonStructure([      // Verifica se o seu 'meta' está lá para o front
                     'data',
                     'meta' => [
                         'current_page',
                         'last_page',
                         'total'
                     ]
                 ]);
    }

    public function test_can_list_users_with_pagination_and_filters(): void
    {
        $this->withoutExceptionHandling();
        $admin = User::factory()->create();

        // Criar usuários específicos para testar a busca
        User::factory()->create(['nome' => 'Jonatas Reis', 'email' => 'jonatas@systock.com']);
        User::factory()->create(['nome' => 'Admin Systock', 'email' => 'admin@systock.com']);
        User::factory(10)->create(); // Outros 10 usuários

        // 1. Test Search
        $response = $this->actingAs($admin)
            ->getJson('/api/usuarios?per_page=10&search=Jonatas');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 1);

        // 2. Test Items Per Page (per_page)
        $response = $this->actingAs($admin)
            ->getJson('/api/usuarios?per_page=5');

        $response->assertJsonCount(5, 'data');

        // 3. Test Sorting (sort_by e sort_order)
        // Create a user with name 'AAAA' to ensure it comes first in ASC sort
        User::factory()->create(['nome' => 'AAAA Test']);
        $response = $this->actingAs($admin)
            ->getJson('/api/usuarios?sort_by=nome&sort_order=asc');

        $this->assertEquals('AAAA Test', $response->json('data.0.nome'));
    }

    public function test_can_create_a_new_user_via_post()
    {
        $admin = User::factory()->create();

        $payload = [
            'nome'  => 'Novo Usuário',
            'email' => 'novo@email.com',
            'cpf'   => '03617116205',
            'senha' => 'password123',
            'senha_confirmation' => 'password123'
        ];

        $response = $this->actingAs($admin)
            ->postJson('/api/usuarios', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('usuarios', ['email' => 'novo@email.com']);
    }

    /** @test */
    public function test_can_update_user()
    {
        $admin = User::factory()->create();
        $user = User::factory()->create(['nome' => 'Nome Antigo']);

        $response = $this->actingAs($admin)
            ->putJson("/api/usuarios/{$user->id}", [
                'nome' => 'Nome Atualizado',
                'email' => $user->email,
                'cpf' => $user->cpf
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('usuarios', ['id' => $user->id, 'nome' => 'Nome Atualizado']);
    }

    /** @test */
    public function test_can_delete_user()
    {
        $admin = User::factory()->create();
        $user = User::factory()->create();

        $response = $this->actingAs($admin)
            ->deleteJson("/api/usuarios/{$user->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('usuarios', ['id' => $user->id]);
    }

    /** @test */
    public function test_can_return_error_when_searching_not_existing_id()
    {
        $admin = User::factory()->create();
        $response = $this->actingAs($admin)
            ->getJson("/api/usuarios/9999");

        $response->assertStatus(404);
    }

}
