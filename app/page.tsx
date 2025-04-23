import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, FileText, ImageIcon, DollarSign, Users, Megaphone } from "lucide-react"

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8 flex justify-center">
            <Image src="/ampla.svg" alt="AMPLA Logo" width={300} height={150} priority />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Associação de Assistência ao Menor de Platina</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Organização sem fins lucrativos dedicada ao desenvolvimento de crianças e adolescentes através do esporte e
            educação.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/mural-de-avisos">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Mural de Avisos
              </Button>
            </Link>
            <Link href="/contato">
              <Button size="lg" variant="outline">
                Entre em Contato
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Portal de Transparência</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Megaphone className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Mural de Avisos</CardTitle>
                <CardDescription>Fique por dentro dos últimos comunicados e notícias da AMPLA.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Acesse informações sobre matrículas, eventos, campanhas e outras notícias importantes.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/mural-de-avisos" className="w-full">
                  <Button variant="outline" className="w-full">
                    Ver Avisos
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Receitas e Despesas</CardTitle>
                <CardDescription>Transparência financeira com detalhes de todas as movimentações.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Consulte as receitas e despesas da associação, com filtros por período e categoria.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/financeiro" className="w-full">
                  <Button variant="outline" className="w-full">
                    Ver Financeiro
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <ImageIcon className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Galeria de Fotos</CardTitle>
                <CardDescription>Imagens das atividades e eventos realizados pela AMPLA.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Veja fotos dos nossos projetos, eventos e do dia a dia das crianças e adolescentes.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/galeria" className="w-full">
                  <Button variant="outline" className="w-full">
                    Ver Galeria
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Livros Contábeis</CardTitle>
                <CardDescription>Documentos contábeis para consulta pública.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Acesse balanços patrimoniais, demonstrações de resultados e outros documentos contábeis.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/livros-contabeis" className="w-full">
                  <Button variant="outline" className="w-full">
                    Ver Documentos
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CalendarDays className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Relatórios de Atividades</CardTitle>
                <CardDescription>Relatórios detalhados das atividades desenvolvidas.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Consulte os relatórios periódicos com informações sobre projetos e ações realizadas.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/relatorios" className="w-full">
                  <Button variant="outline" className="w-full">
                    Ver Relatórios
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Quadro de Diretoria</CardTitle>
                <CardDescription>Conheça os membros da diretoria e conselho fiscal.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Informações sobre a composição da diretoria executiva e do conselho fiscal da AMPLA.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/diretoria" className="w-full">
                  <Button variant="outline" className="w-full">
                    Ver Diretoria
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Sobre a AMPLA</h2>
            <p className="text-lg text-gray-700 mb-8">
              A Associação de Assistência ao Menor de Platina (AMPLA) é uma organização sem fins lucrativos dedicada ao
              desenvolvimento de crianças e adolescentes através do esporte e educação.
            </p>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Informações Institucionais</h3>
              <ul className="text-left space-y-2">
                <li>
                  <strong>CNPJ:</strong> 49.892.987/0001-95
                </li>
                <li>
                  <strong>Endereço:</strong> Rua Ismael Benedito de Camargo, 583 - Centro - Platina/SP
                </li>
                <li>
                  <strong>Telefone:</strong> (18) 3354-1181
                </li>
                <li>
                  <strong>Email:</strong> aampla@gmail.com
                </li>
                <li>
                  <strong>Horário de Funcionamento:</strong> Segunda a Sexta: 8h às 17h
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
