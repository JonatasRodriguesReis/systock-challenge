<template>
  <v-container fluid class="pa-6">
    <v-card class="mb-6 pa-4" border flat color="secondary">
      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-overline">Gestão de Sistema</div>
          <div class="text-h4 font-weight-bold">
            {{ userStore.totalUsers }} Usuários
          </div>
        </div>
        <v-btn
          color="surface"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="openDialog()"
        >
          Novo Usuário
        </v-btn>
      </div>
    </v-card>

    <v-card border flat>
      <v-card-title class="pa-4">
        <v-text-field
          v-model="search"
          label="Buscar por nome ou e-mail"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          @update:model-value="debounceSearch"
        ></v-text-field>
      </v-card-title>

      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="userStore.users"
        :items-length="userStore.paginationMeta?.total || 0"
        :loading="userStore.loading"
        :search="search"
        :page="page"
        @update:options="loadItems"
        hover
      >
        <template v-slot:item.actions="{ item }">
          <v-icon
            size="small"
            class="me-2"
            color="primary"
            @click="openDialog(item)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            size="small"
            color="secondary"
            :disabled="item.id === authStore.user?.id"
            @click="confirmDelete(item)"
          >
            mdi-delete
          </v-icon>
        </template>

        <template v-slot:footer>
          <v-pagination
            v-model="page"
            :length="userStore.paginationMeta?.last_page || 1"
            :total-visible="7"
            @update:model-value="onPageChange"
          ></v-pagination>
        </template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="pa-4 bg-primary text-white">
          {{ editedItem.id ? "Editar Usuário" : "Novo Usuário" }}
        </v-card-title>
        <v-card-text class="pt-4">
          <v-form ref="formRef" v-model="isFormValid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.nome"
                  label="Nome"
                  :rules="rules.nome"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.cpf"
                  label="CPF"
                  v-mask="'###.###.###-##'"
                  :rules="rules.required"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.email"
                  label="E-mail"
                  :rules="rules.email"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" v-if="!editedItem.id">
                <v-text-field
                  v-model="editedItem.senha"
                  label="Senha"
                  type="password"
                  :rules="rules.password"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" v-if="!editedItem.id">
                <v-text-field
                  v-model="editedItem.senha_confirmation"
                  label="Confirmar Senha"
                  type="password"
                  :rules="[
                    (v) => v === editedItem.senha || 'Senhas não conferem',
                  ]"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="dialog = false"
            >Cancelar</v-btn
          >
          <v-btn
            color="primary"
            variant="elevated"
            :loading="saving"
            @click="save"
            >Salvar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogDelete" max-width="400px">
      <v-card class="pa-4 text-center">
        <v-icon color="warning" size="64" class="mb-4"
          >mdi-alert-circle-outline</v-icon
        >
        <div class="text-h6 mb-2">Deseja excluir este usuário?</div>
        <div class="text-body-2 mb-6">Esta ação não pode ser desfeita.</div>
        <div class="d-flex justify-space-between gap-2">
          <v-btn color="grey-lighten-2" flat @click="dialogDelete = false"
            >Cancelar</v-btn
          >
          <v-btn
            color="primary"
            flat
            @click="deleteItemConfirm"
            :loading="deleting"
            >Excluir</v-btn
          >
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useUserStore } from "../stores/user";
import { useAuthStore } from "../stores/auth";

const userStore = useUserStore();
const authStore = useAuthStore();

// Estados
const dialog = ref(false);
const dialogDelete = ref(false);
const isFormValid = ref(false);
const saving = ref(false);
const deleting = ref(false);
const search = ref("");
const itemsPerPage = ref(10);
const page = ref(1);
const formRef = ref(null);
const headers = [
  { title: "ID", key: "id", align: "start" },
  { title: "Nome", key: "nome", align: "start" },
  { title: "E-mail", key: "email", align: "start" },
  { title: "Ações", key: "actions", sortable: false, align: "end" },
];

const editedItem = reactive({
  id: null,
  nome: "",
  cpf: "",
  email: "",
  senha: "",
  senha_confirmation: "",
});

// Validações
const rules = {
  required: [(v) => !!v || "Campo obrigatório"],
  nome: [
    (v) => !!v || "Obrigatório",
    (v) => v.length >= 3 || "Mínimo 3 caracteres",
  ],
  email: [
    (v) => !!v || "Obrigatório",
    (v) => /.+@.+\..+/.test(v) || "E-mail inválido",
  ],
  password: [
    (v) => !!v || "Obrigatório",
    (v) => v.length >= 6 || "Mínimo 6 caracteres",
  ],
};

// Lógica de Tabela
const loadItems = ({ page, itemsPerPage, sortBy }) => {
  userStore.fetchUsers({
    page,
    per_page: itemsPerPage,
    search: search.value,
    sort_by: sortBy[0]?.key || "id",
    sort_order: sortBy[0]?.order || "asc",
  });
};

const debounceSearch = () => {
  // O v-data-table-server já reage à mudança da prop :search automaticamente
};

// CRUD
const openDialog = (item = null) => {
  Object.assign(
    editedItem,
    item || {
      id: null,
      nome: "",
      cpf: "",
      email: "",
      senha: "",
      senha_confirmation: "",
    }
  );
  dialog.value = true;
};

const save = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    await userStore.saveUser(editedItem);
    dialog.value = false;
    resetPagination();
    userStore.fetchUsers({ page: page.value, per_page: itemsPerPage.value }); // Refresh
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (item) => {
  editedItem.id = item.id;
  dialogDelete.value = true;
};

const deleteItemConfirm = async () => {
  deleting.value = true;
  try {
    await userStore.deleteUser(editedItem.id);
    dialogDelete.value = false;
    // Reset table pagination after deletion
    resetPagination();
    userStore.fetchUsers({ page: page, per_page: itemsPerPage.value });
  } finally {
    deleting.value = false;
  }
};

const resetPagination = () => {
  page.value = 1;
  search.value = "";
};

const onPageChange = (newPage) => {
  page.value = newPage;
  // O loadItems será disparado automaticamente pelo v-data-table-server
  // se você estiver usando o v-model:page
};
</script>
